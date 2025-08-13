// sanity/schemaTypes/courseType.tsx
import { defineField, defineType } from "sanity";

export const courseType = defineType({
  name: "course",
  title: "Course",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Course Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "image",
      title: "Course Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "instructor",
      title: "Instructor",
      type: "reference",
      to: [{ type: "instructor" }],
      validation: (rule) => rule.required(),
    }),
    // PRICING FIELDS - NEW STRUCTURE
    defineField({
      name: "individualPrice",
      title: "Individual Price (B2C)",
      type: "number",
      validation: (rule) => rule.required().min(0),
      description: "Price for individual learners in USD",
      initialValue: 1000,
    }),
    defineField({
      name: "organizationPrice",
      title: "Organization Price (B2B)",
      type: "number",
      validation: (rule) => rule.required().min(0),
      description: "Price for entire organization (unlimited employees) in USD",
      initialValue: 5000,
    }),
    defineField({
      name: "price",
      title: "Legacy Price (Deprecated)",
      type: "number",
      hidden: true, // Hide this field since we're using the new pricing
      description:
        "This field is deprecated. Use individualPrice and organizationPrice instead.",
    }),
    defineField({
      name: "isFree",
      title: "Is Free Course?",
      type: "boolean",
      initialValue: false,
      description: "Check this to make the course free for everyone",
    }),
    defineField({
      name: "modules",
      title: "Course Modules",
      type: "array",
      of: [{ type: "reference", to: [{ type: "module" }] }],
    }),
    defineField({
      name: "content",
      title: "Course Content",
      type: "blockContent",
    }),
    defineField({
      name: "learningObjectives",
      title: "Learning Objectives",
      type: "array",
      of: [{ type: "string" }],
      description: "What students will learn from this course",
    }),
    defineField({
      name: "requirements",
      title: "Requirements",
      type: "array",
      of: [{ type: "string" }],
      description: "Prerequisites or requirements for this course",
    }),
    defineField({
      name: "level",
      title: "Course Level",
      type: "string",
      options: {
        list: [
          { title: "Beginner", value: "beginner" },
          { title: "Intermediate", value: "intermediate" },
          { title: "Advanced", value: "advanced" },
          { title: "All Levels", value: "all-levels" },
        ],
        layout: "dropdown",
      },
      initialValue: "all-levels",
    }),
    defineField({
      name: "featured",
      title: "Featured Course",
      type: "boolean",
      initialValue: false,
      description: "Show this course in featured sections",
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
  ],
  preview: {
    select: {
      title: "title",
      subtitle: "description",
      media: "image",
      individualPrice: "individualPrice",
      organizationPrice: "organizationPrice",
    },
    prepare(selection) {
      const { title, subtitle, media, individualPrice, organizationPrice } =
        selection;
      return {
        title,
        subtitle: `Individual: $${individualPrice || 0} | Org: $${
          organizationPrice || 0
        }`,
        media,
      };
    },
  },
});
