// shared/mysql-schema.ts - MySQL兼容的数据库Schema
// 适配DreaModa主项目的MySQL数据库结构

import { sql } from "drizzle-orm";
import { 
  mysqlTable, 
  text, 
  varchar, 
  json, 
  int, 
  timestamp,
  mysqlEnum 
} from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =============================================
// 核心产品表（对应DreaModa的product_variant）
// =============================================
export const products = mysqlTable("product_variant", {
  id: int("id").primaryKey().autoincrement(),
  productId: int("product_id").notNull(),
  name: varchar("computed_name", { length: 255 }).notNull(), // 计算字段：产品名+颜色
  description: text("computed_description"), // 计算字段：从关联表获取
  category: varchar("computed_category", { length: 100 }), // 计算字段：从关联表获取
  fabric: varchar("computed_material", { length: 100 }), // 材质信息
  season: varchar("computed_season", { length: 50 }).default("all-season"), // 季节
  care: text("computed_care").default("Machine wash cold"), // 护理说明
  origin: varchar("computed_origin", { length: 100 }).default("Made in Italy"), // 产地
  sku: varchar("sku", { length: 100 }),
  images: json("computed_images").$type<string[]>().notNull().default([]), // 从product_media聚合
  specifications: json("computed_specs").$type<Record<string, string>>().notNull().default({}),
  featured: mysqlEnum("computed_featured", ["yes", "no"]).notNull().default("no"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// =============================================
// 季节表
// =============================================
export const seasons = mysqlTable("seasons", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("season_name", { length: 100 }).notNull(),
});

// =============================================
// 询价表（对应联系表单）
// =============================================
export const inquiries = mysqlTable("contact_messages", {
  id: int("id").primaryKey().autoincrement(),
  firstName: varchar("first_name", { length: 50 }).notNull(),
  lastName: varchar("last_name", { length: 50 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  company: varchar("company", { length: 100 }),
  businessType: varchar("business_type", { length: 50 }).default("retail"),
  message: text("message").notNull(),
  productId: int("product_id"), // 关联产品变体ID
  inquiryType: mysqlEnum("inquiry_type", ["general", "sample", "catalog"]).notNull().default("general"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// =============================================
// 视图查询类型定义
// =============================================

// 产品插入Schema
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// 询价插入Schema
export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
});

// TypeScript类型导出
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;

// =============================================
// 数据库视图SQL（需要在MySQL中创建）
// =============================================

export const createViewsSQL = `
-- 创建产品详情视图，聚合所有相关信息
CREATE OR REPLACE VIEW product_details_view AS
SELECT 
    v.id,
    v.product_id,
    CONCAT(COALESCE(pi.name, p.base_name), ' - ', COALESCE(cli.name, clr.color_name)) AS computed_name,
    COALESCE(pi.description, p.description) AS computed_description,
    COALESCE(ci.name, c.category_name_en) AS computed_category,
    COALESCE(mi.name, m.material_name) AS computed_material,
    p.season AS computed_season,
    'Dry clean recommended' AS computed_care,
    'Made in Italy' AS computed_origin,
    v.sku,
    v.default_image,
    CASE WHEN p.status = 'published' THEN 'yes' ELSE 'no' END AS computed_featured,
    (
        SELECT JSON_ARRAYAGG(pm.image_path)
        FROM product_media pm
        WHERE pm.variant_id = v.id
        ORDER BY pm.sort_order, pm.id
    ) AS computed_images,
    JSON_OBJECT(
        'Color', COALESCE(cli.name, clr.color_name),
        'Material', COALESCE(mi.name, m.material_name),
        'SKU', v.sku,
        'Category', COALESCE(ci.name, c.category_name_en)
    ) AS computed_specs,
    v.created_at,
    v.created_at AS updated_at
FROM product_variant v
JOIN product p ON v.product_id = p.id
LEFT JOIN category c ON p.category_id = c.id
LEFT JOIN seasons s ON p.season_id = s.id
LEFT JOIN color clr ON v.color_id = clr.id
LEFT JOIN material m ON v.material_id = m.id
LEFT JOIN product_i18n pi ON p.id = pi.product_id AND pi.locale = 'en-GB'
LEFT JOIN category_i18n ci ON c.id = ci.category_id AND ci.locale = 'en-GB'
LEFT JOIN color_i18n cli ON clr.id = cli.color_id AND cli.locale = 'en-GB'
LEFT JOIN material_i18n mi ON m.id = mi.material_id AND mi.locale = 'en-GB'
WHERE p.status = 'published';

-- 创建联系消息视图，统一格式
CREATE OR REPLACE VIEW contact_inquiries_view AS
SELECT 
    id,
    SUBSTRING_INDEX(name, ' ', 1) AS first_name,
    SUBSTRING_INDEX(name, ' ', -1) AS last_name,
    email,
    COALESCE(company, 'Individual') AS company,
    'retail' AS business_type,
    message,
    NULL AS product_id,
    'general' AS inquiry_type,
    ip_address,
    created_at
FROM contact_messages;
`;

// =============================================
// API适配器类型
// =============================================

export interface ProductWithRelations extends Product {
  siblings?: Product[];
  media?: string[];
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

export interface ColorInfo {
  id: number;
  name: string;
  code?: string;
}

export interface MaterialInfo {
  id: number;
  name: string;
}