// 重新导出共享类型
export type { Product, Inquiry, InsertProduct, InsertInquiry, ApiResponse, PaginatedResponse } from "@shared/schema";

export interface FilterState {
  category: string;
  fabric: string;
  season: string;
  style: string;
}

export interface SearchState {
  isOpen: boolean;
  query: string;
}

export interface ProductModalState {
  isOpen: boolean;
  productId: string | null;
}

// 筛选选项接口
export interface FilterOption {
  id: string;
  name: string;
  label: string;
}

// 从DreaModa API动态获取的静态数据，这里保留作为后备
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
  { id: 'retail', name: 'Retailer', label: 'Retailer' },
  { id: 'distributor', name: 'Distributor', label: 'Distributor' },
  { id: 'brand', name: 'Fashion Brand', label: 'Fashion Brand' },
  { id: 'other', name: 'Other', label: 'Other' },
];

export const INQUIRY_TYPES = [
  { id: 'general', name: 'General Inquiry', label: 'General Inquiry' },
  { id: 'sample', name: 'Sample Request', label: 'Sample Request' },
  { id: 'catalog', name: 'Catalog Request', label: 'Catalog Request' },
  { id: 'other', name: 'Other', label: 'Other' },
];