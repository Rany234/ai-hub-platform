import { z } from "zod";

export const listingMetadataSchema = z.object({
  delivery_days: z.coerce
    .number()
    .int({ message: "预计交付天数必须为整数" })
    .positive({ message: "预计交付天数必须大于 0" }),
});

export type ListingMetadata = z.infer<typeof listingMetadataSchema>;

export const serviceOptionSchema = z.object({
  label: z.string().min(1, "选项名称不能为空").max(100, "选项名称不能超过 100 字符"),
  price: z.coerce.number().min(0, "额外价格不能为负数"),
});

export type ServiceOption = z.infer<typeof serviceOptionSchema>;

export const createListingSchema = z.object({
  title: z
    .string()
    .min(1, { message: "此项不能为空" })
    .max(200, { message: "标题长度不能超过 200 个字符" }),
  description: z
    .string()
    .max(5000, { message: "描述长度不能超过 5000 个字符" })
    .optional(),
  price: z.coerce
    .number()
    .positive({ message: "价格必须大于 0" }),
  category: z
    .enum(["prompt", "workflow", "image_set"], {
      message: "请选择有效的分类",
    })
    .optional(),
  previewUrl: z.string().url({ message: "请输入有效的链接" }).optional(),
  metadata: listingMetadataSchema,
  options: z.array(serviceOptionSchema).optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
