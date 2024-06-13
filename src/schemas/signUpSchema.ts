import { z } from "zod";


export const usernameValidation = z
  .string()
  .min(2, "Username must be atleast two characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special character");


const SignUpSchema = z.object({
  email: z.string().email({message: "Invalid email address"}),
  username: usernameValidation,
  password: z.string().min(8, {message: "Password must be of atleast 8 characters"})
});