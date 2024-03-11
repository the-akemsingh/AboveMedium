import { z } from 'zod';

export const SignupInput = z.object({
  email: z.string().email(),
  password: z.string(),
  name: z.string().optional(),
});
export type SignupInput = z.infer<typeof SignupInput>;

export const SigninInput = z.object({
    email: z.string().email(),
    password: z.string(),
});
export type SigninInput = z.infer<typeof SigninInput>;

export const CreatePostInput = z.object({
  title: z.string(),
  content: z.string(),
});
export type CreatePostInput = z.infer<typeof CreatePostInput>;

export const UpdatePostInput = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
});
export type UpdatePostInput = z.infer<typeof UpdatePostInput>;
