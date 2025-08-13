import { defineField, defineType } from "sanity";

export const moduleType = defineType({
  name: "module",
  title: "Module",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Module Title",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Module Description",
      type: "text",
      description: "Brief description of what this module covers",
    }),
    defineField({
      name: "lessons",
      title: "Lessons",
      type: "array",
      of: [{ type: "reference", to: { type: "lesson" } }],
    }),
  ],
});
