import { z } from "zod";

const signInSchema = z.object({
  identifier: z.string(),
  password: z.string()
});