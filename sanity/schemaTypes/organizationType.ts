import { defineField, defineType } from "sanity";

export const organizationType = defineType({
  name: "organization",
  title: "Organization",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Organization Name",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkOrganizationId",
      title: "Clerk Organization ID",
      type: "string",
      description: "The organization ID from Clerk",
      validation: (rule) => rule.required(),
      readOnly: true,
    }),
    defineField({
      name: "billingEmail",
      title: "Billing Email",
      type: "string",
      validation: (rule) => rule.required().email(),
    }),
    defineField({
      name: "subscriptionStatus",
      title: "Subscription Status",
      type: "string",
      options: {
        list: [
          { title: "Inactive", value: "inactive" },
          { title: "Active", value: "active" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Expired", value: "expired" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      initialValue: "inactive", // No trial - starts as inactive
    }),
    defineField({
      name: "employeeLimit",
      title: "Employee Limit",
      type: "number",
      description: "Maximum number of employees allowed for this organization",
      validation: (rule) => rule.required().min(1),
      initialValue: 10,
    }),
    defineField({
      name: "activeStatus",
      title: "Active Status",
      type: "boolean",
      description: "Whether the organization is currently active",
      initialValue: false, // Not active until subscription
    }),
    defineField({
      name: "createdAt",
      title: "Created Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      readOnly: true,
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      description:
        "The Stripe customer ID for billing (set when subscription is created)",
      readOnly: true,
    }),
    defineField({
      name: "subscriptionEndDate",
      title: "Subscription End Date",
      type: "datetime",
      description: "When the current subscription period ends",
    }),
    defineField({
      name: "subscriptionPlan",
      title: "Subscription Plan",
      type: "string",
      description:
        "Current subscription plan (starter, professional, enterprise)",
      options: {
        list: [
          { title: "Starter", value: "starter" },
          { title: "Professional", value: "professional" },
          { title: "Enterprise", value: "enterprise" },
        ],
        layout: "dropdown",
      },
    }),
    defineField({
      name: "lastPaymentDate",
      title: "Last Payment Date",
      type: "datetime",
      description: "When the last successful payment was received",
    }),
  ],
  preview: {
    select: {
      name: "name",
      subscriptionStatus: "subscriptionStatus",
      employeeLimit: "employeeLimit",
      activeStatus: "activeStatus",
      plan: "subscriptionPlan",
    },
    prepare({ name, subscriptionStatus, employeeLimit, activeStatus, plan }) {
      const statusEmoji: Record<string, string> = {
        active: "✅",
        inactive: "⏸️",
        cancelled: "❌",
        expired: "⏰",
      };

      return {
        title: name || "Unnamed Organization",
        subtitle: `${statusEmoji[subscriptionStatus] || ""} ${subscriptionStatus
          .charAt(0)
          .toUpperCase()}${subscriptionStatus.slice(1)} ${
          plan ? `• ${plan}` : ""
        } • ${employeeLimit} employees`,
      };
    },
  },
});
