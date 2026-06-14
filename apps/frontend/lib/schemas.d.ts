import { z } from 'zod';

export const BirthDateSchema: z.ZodType<Date>;
export const RegisterStep1Schema: z.ZodType<{
  name: string;
  surname: string;
  email: string;
  birthDate: Date;
}>;
export const RegisterStep2Schema: z.ZodType<{
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}>;
export const RegisterSchema: z.ZodType<{
  name: string;
  surname: string;
  email: string;
  birthDate: Date;
  username: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}>;
export const LoginSchema: z.ZodType<{
  username: string;
  password: string;
}>;
export const UpdateEmailSchema: z.ZodType<{ email: string }>;
export const UpdatePasswordSchema: z.ZodType<{  oldPassword: string;
  newPassword: string;
  confirmPassword: string; }>;
export const ProfilePictureSchema: z.ZodType<any>;
export const CoverPictureSchema: z.ZodType<any>;
export const PostImageSchema: z.ZodType<any>;
export const PostVideoSchema: z.ZodType<any>;
export const CompleteChallengeSchema: z.ZodType<any>;
export const CommentSchema: z.ZodType<any>;
export const ReportSchema: z.ZodType<any>;
export const ForgotPasswordSchema: z.ZodType<{ email: string }>;