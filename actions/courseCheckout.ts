// actions/courseCheckout.ts
"use server";

import Stripe from "stripe";
import { client } from "@/sanity/lib/adminClient";
import groq from "groq";
import { auth } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// Default pricing as fallback
const DEFAULT_PRICING = {
  ORGANIZATION: 5000,
  INDIVIDUAL: 1000,
};

interface CreateIndividualCheckoutParams {
  courseId: string;
  courseSlug: string;
}

interface CreateOrganizationCheckoutParams {
  courseId: string;
  courseSlug: string;
  organizationId: string;
}

/**
 * Create checkout session for individual course purchase
 * Uses individualPrice from Sanity or defaults to $1,000
 */
export async function createIndividualCourseCheckout({
  courseId,
  courseSlug,
}: CreateIndividualCheckoutParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get course details with pricing from Sanity
    const courseQuery = groq`*[_type == "course" && _id == $courseId][0] {
      _id,
      title,
      description,
      thumbnail,
      "slug": slug.current,
      individualPrice,
      organizationPrice,
      price,
      isFree
    }`;

    const course = await client.fetch(courseQuery, { courseId });

    if (!course) {
      throw new Error("Course not found");
    }

    // Determine the individual price
    // Priority: individualPrice > price > default
    const coursePrice =
      course.individualPrice || course.price || DEFAULT_PRICING.INDIVIDUAL;

    // Check if course is free
    if (course.isFree || coursePrice === 0) {
      // Handle free course enrollment
      const studentQuery = groq`*[_type == "student" && clerkId == $userId][0] {
        _id
      }`;
      const student = await client.fetch(studentQuery, { userId });

      if (student) {
        // Create free enrollment
        await client.create({
          _type: "enrollment",
          student: {
            _type: "reference",
            _ref: student._id,
          },
          course: {
            _type: "reference",
            _ref: courseId,
          },
          enrolledAt: new Date().toISOString(),
          amount: 0,
          paymentId: "free_" + Date.now(),
        });
      }

      return { url: `${baseUrl}/courses/${courseSlug}?enrolled=true` };
    }

    // Get student data
    const studentQuery = groq`*[_type == "student" && clerkId == $userId][0] {
      _id,
      email,
      firstName,
      lastName
    }`;

    const student = await client.fetch(studentQuery, { userId });

    if (!student) {
      throw new Error("Student record not found");
    }

    // Check if already enrolled
    const existingEnrollment = await client.fetch(
      groq`*[_type == "enrollment" && student._ref == $studentId && course._ref == $courseId][0]`,
      { studentId: student._id, courseId }
    );

    if (existingEnrollment) {
      throw new Error("You already have access to this course");
    }

    // Get course image URL if available
    let courseImageUrl = null;
    if (course.thumbnail?.asset?._ref) {
      const imageId = course.thumbnail.asset._ref;
      const [, id, dimensions, format] = imageId.split("-");
      courseImageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${format}`;
    }

    // Create Stripe checkout session for individual purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer_email: student.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: course.title,
              description:
                course.description || "Lifetime access to course content",
              images: courseImageUrl ? [courseImageUrl] : undefined,
            },
            unit_amount: Math.round(coursePrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard?purchase=success&type=individual&courseId=${courseId}`,
      cancel_url: `${baseUrl}/courses/${
        courseSlug || course.slug
      }?purchase=cancelled`,
      metadata: {
        courseId,
        userId,
        studentId: student._id,
        purchaseType: "individual",
        amount: coursePrice.toString(),
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("Error creating individual checkout:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session"
    );
  }
}

/**
 * Create checkout session for organization course purchase
 * Uses organizationPrice from Sanity or defaults to $5,000
 */
export async function createOrganizationCourseCheckout({
  courseId,
  courseSlug,
  organizationId,
}: CreateOrganizationCheckoutParams) {
  try {
    const { userId } = await auth();

    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Get course details with pricing from Sanity
    const courseQuery = groq`*[_type == "course" && _id == $courseId][0] {
      _id,
      title,
      description,
      thumbnail,
      "slug": slug.current,
      individualPrice,
      organizationPrice,
      price,
      isFree
    }`;

    const course = await client.fetch(courseQuery, { courseId });

    if (!course) {
      throw new Error("Course not found");
    }

    // Determine the organization price
    // Priority: organizationPrice > (price * 5) > default
    const coursePrice =
      course.organizationPrice ||
      (course.price ? course.price * 5 : DEFAULT_PRICING.ORGANIZATION);

    // Check if course is free
    if (course.isFree || coursePrice === 0) {
      // Handle free course for organization
      const orgCourse = await client.create({
        _type: "organizationCourse",
        organization: {
          _type: "reference",
          _ref: organizationId,
        },
        course: {
          _type: "reference",
          _ref: courseId,
        },
        purchasedBy: {
          _type: "reference",
          _ref: userId,
        },
        purchasedAt: new Date().toISOString(),
        amount: 0,
        paymentId: "free_org_" + Date.now(),
        isActive: true,
      });

      return { url: `${baseUrl}/dashboard/organization/courses?enrolled=true` };
    }

    // Get organization from Sanity
    const orgQuery = groq`*[_type == "organization" && _id == $orgId][0] {
      _id,
      name,
      billingEmail,
      stripeCustomerId,
      clerkOrganizationId
    }`;

    const organization = await client.fetch(orgQuery, {
      orgId: organizationId,
    });

    if (!organization) {
      throw new Error("Organization not found");
    }

    // Get the purchasing admin's data
    const adminQuery = groq`*[_type == "student" && clerkId == $userId][0] {
      _id,
      email,
      firstName,
      lastName,
      role,
      organization
    }`;

    const admin = await client.fetch(adminQuery, { userId });

    if (!admin) {
      throw new Error("Admin record not found");
    }

    // Verify admin belongs to this organization and has admin role
    if (admin.organization?._ref !== organizationId || admin.role !== "admin") {
      throw new Error("You must be an organization admin to make purchases");
    }

    // Check if organization already purchased this course
    const existingPurchase = await client.fetch(
      groq`*[_type == "organizationCourse" && organization._ref == $orgId && course._ref == $courseId && isActive == true][0]`,
      { orgId: organizationId, courseId }
    );

    if (existingPurchase) {
      throw new Error("Your organization already has access to this course");
    }

    // Get or create Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: organization.billingEmail,
        name: organization.name,
        metadata: {
          organizationId: organization._id,
          clerkOrgId: organization.clerkOrganizationId,
        },
      });

      customerId = customer.id;

      // Update organization with Stripe customer ID
      await client
        .patch(organization._id)
        .set({ stripeCustomerId: customerId })
        .commit();
    }

    // Get course image URL if available
    let courseImageUrl = null;
    if (course.thumbnail?.asset?._ref) {
      const imageId = course.thumbnail.asset._ref;
      const [, id, dimensions, format] = imageId.split("-");
      courseImageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${id}-${dimensions}.${format}`;
    }

    // Create Stripe checkout session for organization purchase
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `${course.title} - Organization License`,
              description: `Lifetime access for unlimited employees at ${organization.name}`,
              images: courseImageUrl ? [courseImageUrl] : undefined,
            },
            unit_amount: Math.round(coursePrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/dashboard/admin?purchase=success&type=organization&courseId=${courseId}`,
      cancel_url: `${baseUrl}/courses/${
        courseSlug || course.slug
      }?purchase=cancelled`,
      metadata: {
        courseId,
        userId,
        adminId: admin._id,
        organizationId: organization._id,
        purchaseType: "organization",
        amount: coursePrice.toString(),
      },
    });

    return { url: session.url, sessionId: session.id };
  } catch (error) {
    console.error("Error creating organization checkout:", error);
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to create checkout session"
    );
  }
}

/**
 * Check if user has access to course (through individual or organization purchase)
 */
export async function checkCourseAccess(
  userId: string,
  courseId: string
): Promise<{
  hasAccess: boolean;
  accessType?: "individual" | "organization" | "none";
  organizationName?: string;
}> {
  try {
    // Get student data with organization
    const student = await client.fetch(
      groq`*[_type == "student" && clerkId == $userId][0] {
        _id,
        organization->{
          _id,
          name
        }
      }`,
      { userId }
    );

    if (!student) {
      return { hasAccess: false, accessType: "none" };
    }

    // Check individual enrollment
    const individualEnrollment = await client.fetch(
      groq`*[_type == "enrollment" && student._ref == $studentId && course._ref == $courseId][0]`,
      { studentId: student._id, courseId }
    );

    if (individualEnrollment) {
      return { hasAccess: true, accessType: "individual" };
    }

    // Check organization purchase if user belongs to an organization
    if (student.organization?._id) {
      const organizationPurchase = await client.fetch(
        groq`*[_type == "organizationCourse" && 
             organization._ref == $orgId && 
             course._ref == $courseId && 
             isActive == true][0]`,
        { orgId: student.organization._id, courseId }
      );

      if (organizationPurchase) {
        return {
          hasAccess: true,
          accessType: "organization",
          organizationName: student.organization.name,
        };
      }
    }

    return { hasAccess: false, accessType: "none" };
  } catch (error) {
    console.error("Error checking course access:", error);
    return { hasAccess: false, accessType: "none" };
  }
}
