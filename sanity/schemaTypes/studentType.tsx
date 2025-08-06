import Image from "next/image";
import { defineField, defineType } from "sanity";

export const studentType = defineType({
  name: "student",
  title: "Student",
  type: "document",
  fields: [
    defineField({
      name: "firstName",
      title: "First Name",
      type: "string",
    }),
    defineField({
      name: "lastName",
      title: "Last Name",
      type: "string",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "clerkId",
      title: "Clerk User ID",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "imageUrl",
      title: "Profile Image URL",
      type: "url",
    }),
    defineField({
      name: "organization",
      title: "Organization",
      type: "reference",
      to: [{ type: "organization" }],
      description: "The organization this student belongs to (if applicable)",
    }),
    defineField({
      name: "role",
      title: "Organization Role",
      type: "string",
      options: {
        list: [
          { title: "Employee", value: "employee" },
          { title: "Admin", value: "admin" },
        ],
        layout: "dropdown",
      },
      description:
        "Role within the organization (only applicable for B2B users)",
      hidden: ({ document }) => !document?.organization,
    }),
    defineField({
      name: "invitedDate",
      title: "Invited Date",
      type: "datetime",
      description: "When the user was invited to join the organization",
      hidden: ({ document }) => !document?.organization,
    }),
    defineField({
      name: "acceptedDate",
      title: "Accepted Date",
      type: "datetime",
      description: "When the user accepted the organization invitation",
      hidden: ({ document }) => !document?.organization,
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      imageUrl: "imageUrl",
      organizationName: "organization.name",
      role: "role",
    },
    prepare({ firstName, lastName, imageUrl, organizationName, role }) {
      const name =
        `${firstName?.charAt(0).toUpperCase()}${
          firstName?.slice(1) || ""
        } ${lastName?.charAt(0).toUpperCase()}${
          lastName?.slice(1) || ""
        }`.trim() || "Unnamed Student";

      let subtitle = "";
      if (organizationName) {
        subtitle = `${organizationName}${
          role ? ` • ${role.charAt(0).toUpperCase()}${role.slice(1)}` : ""
        }`;
      }

      return {
        title: name,
        subtitle: subtitle || undefined,
        media: imageUrl ? (
          <Image src={imageUrl} alt={name} width={100} height={100} />
        ) : undefined,
      };
    },
  },
});
