import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱格式" }),
  password: z.string().min(6, { message: "密码至少 6 个字符" }),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signUpSchema = z.object({
  email: z.string().email({ message: "请输入有效的邮箱格式" }),
  password: z.string().min(6, { message: "密码至少 6 个字符" }),
  username: z
    .string()
    .min(3, { message: "用户名至少需要 3 个字符" })
    .max(50, { message: "用户名最多只能包含 50 个字符" })
    .optional()
    .or(z.literal("")),
  fullName: z
    .string()
    .min(1, { message: "真实姓名不能为空" })
    .max(200, { message: "真实姓名最多只能包含 200 个字符" })
    .optional()
    .or(z.literal("")),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
