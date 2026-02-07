import { z } from "zod";

export const listingMetadataSchema = z.object({
  delivery_days: z.coerce
    .number()
    .int({ message: "预计交付天数必须为整数" })
    .positive({ message: "预计交付天数必须大于 0" }),
});

export type ListingMetadata = z.infer<typeof listingMetadataSchema>;

export const listingPackageSchema = z.object({
  enabled: z.coerce.boolean().default(true),
  price: z.coerce.number().positive({ message: "价格必须大于 0" }),
  delivery_days: z.coerce
    .number()
    .int({ message: "预计交付天数必须为整数" })
    .positive({ message: "预计交付天数必须大于 0" }),
  features: z.array(z.string().min(1)).default([]),
});

export type ListingPackage = z.infer<typeof listingPackageSchema>;

export const listingPackagesSchema = z
  .object({
    basic: listingPackageSchema,
    standard: listingPackageSchema,
    premium: listingPackageSchema,
  })
  .superRefine((val, ctx) => {
    const basicEnabled = val.basic.enabled !== false;
    const standardEnabled = val.standard.enabled !== false;
    const premiumEnabled = val.premium.enabled !== false;

    if (!basicEnabled) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "基础版（Basic）不能被禁用",
        path: ["basic", "enabled"],
      });
      return;
    }

    const pBasic = val.basic.price;
    const pStandard = val.standard.price;
    const pPremium = val.premium.price;

    if (standardEnabled && !(pStandard > pBasic)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "标准版价格必须大于基础版",
        path: ["standard", "price"],
      });
    }

    if (premiumEnabled) {
      if (standardEnabled) {
        if (!(pPremium > pStandard)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "高级版价格必须大于标准版",
            path: ["premium", "price"],
          });
        }
      } else {
        if (!(pPremium > pBasic)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "高级版价格必须大于基础版",
            path: ["premium", "price"],
          });
        }
      }
    }
  });

export type ListingPackages = z.infer<typeof listingPackagesSchema>;

export const createListingSchema = z.object({
  title: z
    .string()
    .min(1, { message: "此项不能为空" })
    .max(200, { message: "标题长度不能超过 200 个字符" }),
  description: z
    .string()
    .max(5000, { message: "描述长度不能超过 5000 个字符" })
    .optional(),
  category: z
    .enum(["prompt", "workflow", "image_set"], {
      message: "请选择有效的分类",
    })
    .optional(),
  previewUrl: z.string().url({ message: "请输入有效的链接" }).optional(),
  packages: listingPackagesSchema,
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
