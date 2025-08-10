// sanity/lib/student/createStudentIfNotExistsServer.ts
// This version is safe to use in API routes and server components
import groq from "groq";
import { client } from "../adminClient";

interface CreateStudentProps {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
}

export async function createStudentIfNotExistsServer({
  clerkId,
  email,
  firstName,
  lastName,
  imageUrl,
}: CreateStudentProps) {
  try {
    // First check if student exists using the admin client
    const existingStudentQuery = groq`*[_type == "student" && clerkId == $clerkId][0]`;
    const existingStudent = await client.fetch(existingStudentQuery, {
      clerkId,
    });

    if (existingStudent) {
      console.log("Student already exists:", existingStudent._id);
      return existingStudent;
    }

    // If no student exists, create a new one
    const newStudent = await client.create({
      _type: "student",
      clerkId,
      email,
      firstName: firstName || email.split("@")[0],
      lastName: lastName || "",
      imageUrl: imageUrl || "",
      createdAt: new Date().toISOString(),
    });

    console.log("New student created:", newStudent._id);
    return newStudent;
  } catch (error) {
    console.error("Error in createStudentIfNotExistsServer:", error);
    throw error;
  }
}
