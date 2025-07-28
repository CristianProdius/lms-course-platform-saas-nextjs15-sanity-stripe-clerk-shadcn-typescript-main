import { defineField, defineType } from "sanity";

export const lessonType = defineType({
  name: "lesson",
  title: "Lesson",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
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
    }),
    defineField({
      name: "videoUrl",
      title: "Video URL",
      type: "url",
      description: "The URL for the video player (e.g. YouTube, Vimeo)",
    }),
    defineField({
      name: "loomUrl",
      title: "Loom Share URL",
      type: "url",
      description:
        "The full Loom share URL (e.g., https://www.loom.com/share/...)",
      validation: (rule) =>
        rule.custom((value) => {
          if (!value) return true; // Allow empty value
          try {
            const url = new URL(value);
            if (!url.hostname.endsWith("loom.com")) {
              return "URL must be from loom.com";
            }
            if (!url.pathname.startsWith("/share/")) {
              return "Must be a Loom share URL";
            }
            const videoId = url.pathname.split("/share/")[1];
            if (!/^[a-f0-9-]{32,36}/.test(videoId)) {
              return "Invalid Loom video ID in URL";
            }
            return true;
          } catch {
            return "Please enter a valid URL";
          }
        }),
    }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "resources",
      title: "Lesson Resources",
      type: "array",
      description: "Upload PDF files and other resources for this lesson",
      of: [
        {
          type: "object",
          name: "lessonResource", // Add explicit name
          title: "Resource",
          fields: [
            {
              name: "title",
              title: "Resource Title",
              type: "string",
              description: "Display name for the resource",
              validation: (rule) => rule.required(),
            },
            {
              name: "description",
              title: "Description",
              type: "text",
              description: "Brief description of the resource (optional)",
              rows: 2,
            },
            {
              name: "file",
              title: "File",
              type: "file",
              description: "Upload PDF or other document files",
              options: {
                accept: ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt",
                storeOriginalFilename: true,
              },
              validation: (rule) => rule.required().assetRequired(),
            },
            {
              name: "fileType",
              title: "File Type",
              type: "string",
              description: "Select the type of file",
              options: {
                list: [
                  { title: "PDF", value: "pdf" },
                  { title: "Word Document", value: "doc" },
                  { title: "PowerPoint", value: "ppt" },
                  { title: "Excel", value: "xls" },
                  { title: "Text File", value: "txt" },
                  { title: "Other", value: "other" },
                ],
                layout: "dropdown",
              },
              initialValue: "pdf",
              validation: (rule) => rule.required(),
            },
          ],
          preview: {
            select: {
              title: "title",
              fileType: "fileType",
            },
            prepare(selection) {
              const { title, fileType } = selection;
              return {
                title: title || "Untitled Resource",
                subtitle: fileType ? fileType.toUpperCase() : "File",
              };
            },
          },
        },
      ],
    }),
  ],
});
