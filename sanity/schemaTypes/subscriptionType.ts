import { defineField, defineType } from "sanity";

export const subscriptionType = defineType({
  name: "subscription",
  title: "Subscription",
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
      name: "plan",
      title: "Subscription Plan",
      type: "string",
      options: {
        list: [
          { title: "Starter", value: "starter" },
          { title: "Professional", value: "professional" },
          { title: "Enterprise", value: "enterprise" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "employeeLimit",
      title: "Employee Limit",
      type: "number",
      validation: (rule) => rule.required().min(1),
      description:
        "Maximum number of employees allowed under this subscription",
    }),
    defineField({
      name: "pricePerMonth",
      title: "Price Per Month",
      type: "number",
      validation: (rule) => rule.required().min(0),
      description: "Monthly subscription price in USD",
    }),
    defineField({
      name: "startDate",
      title: "Start Date",
      type: "datetime",
      validation: (rule) => rule.required(),
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "endDate",
      title: "End Date",
      type: "datetime",
      validation: (rule) => rule.required(),
      description: "When the current subscription period ends",
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Cancelled", value: "cancelled" },
          { title: "Expired", value: "expired" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      initialValue: "active",
    }),
    defineField({
      name: "stripeSubscriptionId",
      title: "Stripe Subscription ID",
      type: "string",
      validation: (rule) => rule.required(),
      description: "The Stripe subscription ID for billing management",
    }),
    defineField({
      name: "cancelledAt",
      title: "Cancelled At",
      type: "datetime",
      description: "Date when the subscription was cancelled (if applicable)",
    }),
    defineField({
      name: "courses",
      title: "Included Courses",
      type: "array",
      of: [{ type: "reference", to: [{ type: "course" }] }],
      description: "Courses included in this subscription plan",
    }),
  ],
  preview: {
    select: {
      organizationName: "organization.name",
      plan: "plan",
      status: "status",
      pricePerMonth: "pricePerMonth",
      employeeLimit: "employeeLimit",
    },
    prepare({ organizationName, plan, status, pricePerMonth, employeeLimit }) {
      const planTitle = plan
        ? `${plan.charAt(0).toUpperCase()}${plan.slice(1)}`
        : "Unknown";
      const statusBadge = status
        ? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
        : "Unknown";

      return {
        title: `${organizationName || "Unknown Organization"} - ${planTitle}`,
        subtitle: `$${pricePerMonth?.toLocaleString("en-US", {
          minimumFractionDigits: 2,
        })}/month • ${employeeLimit} employees • ${statusBadge}`,
      };
    },
  },
});
