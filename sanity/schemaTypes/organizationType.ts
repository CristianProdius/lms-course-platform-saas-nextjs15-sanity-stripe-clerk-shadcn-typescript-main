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
          { title: "Active", value: "active" },
          { title: "Trial", value: "trial" },
          { title: "Inactive", value: "inactive" },
          { title: "Cancelled", value: "cancelled" },
        ],
        layout: "dropdown",
      },
      validation: (rule) => rule.required(),
      initialValue: "trial",
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
      initialValue: true,
    }),
    defineField({
      name: "createdAt",
      title: "Created Date",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "stripeCustomerId",
      title: "Stripe Customer ID",
      type: "string",
      description: "The Stripe customer ID for billing",
      readOnly: true,
    }),
    defineField({
      name: "subscriptionEndDate",
      title: "Subscription End Date",
      type: "datetime",
      description: "When the current subscription period ends",
    }),
  ],
  preview: {
    select: {
      name: "name",
      subscriptionStatus: "subscriptionStatus",
      employeeLimit: "employeeLimit",
      activeStatus: "activeStatus",
    },
    prepare({ name, subscriptionStatus, employeeLimit, activeStatus }) {
      return {
        title: name || "Unnamed Organization",
        subtitle: `${subscriptionStatus
          .charAt(0)
          .toUpperCase()}${subscriptionStatus.slice(
          1
        )} • ${employeeLimit} employees • ${
          activeStatus ? "Active" : "Inactive"
        }`,
      };
    },
  },
});
