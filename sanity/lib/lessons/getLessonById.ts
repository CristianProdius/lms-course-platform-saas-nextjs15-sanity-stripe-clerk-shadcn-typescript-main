import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getLessonById(id: string) {
  const getLessonByIdQuery =
    defineQuery(`*[_type == "lesson" && _id == $id][0] {
    ...,
    resources[] {
      _key,
      title,
      description,
      file {
        _type,
        asset-> {
          _id,
          _type,
          url,
          originalFilename,
          extension,
          size
        }
      },
      fileType
    },
    "module": module->{
      ...,
      "course": course->{...}
    }
  }`);

  const result = await sanityFetch({
    query: getLessonByIdQuery,
    params: { id },
  });

  return result.data;
}
