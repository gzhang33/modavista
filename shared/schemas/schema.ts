import { z } from "zod";

// 适配DreamModa PHP API的类型定义
// 严格遵循TypeScript类型规范

export interface Product {
  id: number | string; // 兼容UUID和数字ID
  productId?: number;
  name: string;
  baseName?: string;
  description: string;
  category: string;
  color?: string; // 颜色名称
  material?: string; // 材质名称
  fabric: string; // 对应DreamModa的material字段
  style: string;
  season: string;
  care: string;
  origin: string;
  sku: string;
  images: string[]; // 严格类型检查 - 必须为string[]
  specifications: Record<string, string>;
  featured: "yes" | "no"; // 严格类型检查 - 必须为"yes"|"no"
  defaultImage?: string;
  createdAt?: string;
  siblings?: Product[];
}

export interface Inquiry {
  id: number | string; // 兼容UUID和数字ID
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  businessType: string;
  message: string;
  productId?: number | string; // 兼容不同ID类型
  inquiryType: "general" | "sample" | "catalog"; // 严格类型检查
  ipAddress?: string;
  createdAt?: string;
}

// API响应包装类型
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  code?: number;
  timestamp: string;
}

// 分页响应类型
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    products?: T[];
    items?: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message: string;
  timestamp: string;
}

// Zod验证Schema - 用于表单验证
export const inquirySchema = z.object({
  firstName: z.string().min(1, "名字不能为空"),
  lastName: z.string().min(1, "姓氏不能为空"),
  email: z.string().email("请输入有效的邮箱地址"),
  company: z.string().min(1, "公司名称不能为空"),
  businessType: z.string().min(1, "请选择业务类型"),
  message: z.string().min(10, "消息内容至少需要10个字符"),
  productId: z.number().optional(),
  inquiryType: z.enum(["general", "sample", "catalog"]).default("general"),
});

// 导出类型别名以保持兼容性
export type InsertInquiry = z.infer<typeof inquirySchema>;
export type InsertProduct = Omit<Product, 'id' | 'createdAt'>;

// 重新导出以保持向后兼容
export const insertInquirySchema = inquirySchema;