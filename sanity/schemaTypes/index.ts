import { type SchemaTypeDefinition } from "sanity";
import { courseType } from "./courseType";
import { moduleType } from "./moduleType";
import { lessonType } from "./lessonType";
import { instructorType } from "./instructorType";
import { blockContent } from "./blockContent";
import { studentType } from "./studentType";
import { enrollmentType } from "./enrollmentType";
import { categoryType } from "./categoryType";
import { lessonCompletionType } from "./lessonCompletionType";
import { organizationType } from "./organizationType";

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    courseType,
    moduleType,
    lessonType,
    instructorType,
    blockContent,
    studentType,
    enrollmentType,
    categoryType,
    lessonCompletionType,
    organizationType,
  ],
};

export * from "./courseType";
export * from "./moduleType";
export * from "./lessonType";
export * from "./instructorType";
export * from "./studentType";
export * from "./enrollmentType";
export * from "./categoryType";
export * from "./lessonCompletionType";
export * from "./organizationType";
