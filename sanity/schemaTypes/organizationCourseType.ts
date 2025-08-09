import { defineField, defineType } from "sanity";

export const organizationCourseType = defineType({
  name: "organizationCourse",
  title: "Organization Course",
  type: "document",
  fields: [
    defineField({
      name: "organization",
      title: "Organization",
      type: "reference",
      to: [{ type: "organization" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "course",
      title: "Course",
      type: "reference",
      to: [{ type: "course" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "purchasedBy",
      title: "Purchased By",
      type: "reference",
      to: [{ type: "student" }],
      description: "The admin who purchased this course",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "amount",
      title: "Amount",
      type: "number",
      validation: (rule) => rule.required().min(0),
      description: "The amount paid for the course in cents",
    }),
    defineField({
      name: "paymentId",
      title: "Payment ID",
      type: "string",
      validation: (rule) => rule.required(),
      description: "The Stripe payment/checkout session ID",
    }),
    defineField({
      name: "purchasedAt",
      title: "Purchased At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "expiresAt",
      title: "Expires At",
      type: "datetime",
      description: "Optional expiration date for the course access",
    }),
    defineField({
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description:
        "Whether this course is currently accessible to organization members",
    }),
  ],
  preview: {
    select: {
      courseTitle: "course.title",
      organizationName: "organization.name",
      purchasedAt: "purchasedAt",
    },
    prepare({ courseTitle, organizationName, purchasedAt }) {
      return {
        title: `${organizationName} - ${courseTitle}`,
        subtitle: `Purchased: ${new Date(purchasedAt).toLocaleDateString()}`,
      };
    },
  },
});
