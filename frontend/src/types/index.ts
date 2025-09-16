// 重新导出共享类型
export type { Product, Inquiry, InsertProduct, InsertInquiry, ApiResponse, PaginatedResponse } from "@shared/schemas/schema";

export interface FilterState {
  category: string;
  fabric: string;
  season: string;
  style: string;
  color: string;
}

export interface LanguageState {
  currentLanguage: string;
  availableLanguages: Language[];
}

export interface Language {
  language_code: string;
  language_name: string;
  language_name_native: string;
  is_default: boolean;
}

export interface ProductModalState {
  isOpen: boolean;
  productId: string | null;
}

// 筛选选项接口
export interface Category {
  id: string;
  name: string;
  image: string;
  english_name: string;
}

export interface FilterOption {
  id: string;
  name: string;
  label: string;
  english_name?: string;
}

// 从DreamModa API动态获取的静态数据，这里保留作为后备
// 注意：实际应用中应优先使用 fetchAllFilterOptions() 获取最新数据
export const CATEGORIES: FilterOption[] = [
  { id: 'all', name: 'All', label: 'All Categories' },
  { id: 'shirts', name: 'Shirts', label: 'Shirts' },
  { id: 'dresses', name: 'Dresses', label: 'Dresses' },
  { id: 'pants', name: 'Pants', label: 'Pants' },
  { id: 'jackets', name: 'Jackets', label: 'Jackets' },
  { id: 'accessories', name: 'Accessories', label: 'Accessories' },
];

export const FABRICS: FilterOption[] = [
  { id: 'all', name: 'All Fabrics', label: 'All Fabrics' },
  { id: 'cotton', name: 'Cotton', label: 'Cotton' },
  { id: 'silk', name: 'Silk', label: 'Silk' },
  { id: 'wool', name: 'Wool', label: 'Wool' },
  { id: 'linen', name: 'Linen', label: 'Linen' },
  { id: 'cashmere', name: 'Cashmere', label: 'Cashmere' },
  { id: 'polyester', name: 'Polyester', label: 'Polyester' },
  { id: 'denim', name: 'Denim', label: 'Denim' },
  { id: 'leather', name: 'Leather', label: 'Leather' },
];

export const SEASONS: FilterOption[] = [
  { id: 'all', name: 'All Seasons', label: 'All Seasons' },
  { id: 'spring-summer', name: 'Spring/Summer', label: 'Spring/Summer' },
  { id: 'fall-winter', name: 'Fall/Winter', label: 'Fall/Winter' },
  { id: 'all-season', name: 'All Season', label: 'All Season' },
];



export const BUSINESS_TYPES = [
  { id: 'retail', name: 'Retailer', labelKey: 'contact.business_types.retailer' },
  { id: 'distributor', name: 'Distributor', labelKey: 'contact.business_types.distributor' },
  { id: 'brand', name: 'Fashion Brand', labelKey: 'contact.business_types.fashion_brand' },
  { id: 'other', name: 'Other', labelKey: 'contact.business_types.other' },
];

export const INQUIRY_TYPES = [
  { id: 'general', name: 'General Inquiry', label: 'General Inquiry' },
  { id: 'sample', name: 'Sample Request', label: 'Sample Request' },
  { id: 'catalog', name: 'Catalog Request', label: 'Catalog Request' },
  { id: 'other', name: 'Other', label: 'Other' },
];