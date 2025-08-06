// sanity/lib/student/getStudentByClerkId.ts
import { defineQuery } from "groq";
import { sanityFetch } from "../live";

export async function getStudentByClerkId(clerkId: string) {
  const getStudentByClerkIdQuery = defineQuery(
    `*[_type == "student" && clerkId == $clerkId][0] {
      _id,
      _type,
      _createdAt,
      _updatedAt,
      _rev,
      firstName,
      lastName,
      email,
      clerkId,
      imageUrl,
      organization,
      role,
      invitedDate,
      acceptedDate
    }`
  );

  const student = await sanityFetch({
    query: getStudentByClerkIdQuery,
    params: { clerkId },
  });

  return student;
}
