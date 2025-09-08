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

export const CATEGORIES = [
  { id: 'all', name: 'All', label: 'All Categories' },
  { id: 'shirts', name: 'Shirts', label: 'Shirts' },
  { id: 'dresses', name: 'Dresses', label: 'Dresses' },
  { id: 'pants', name: 'Pants', label: 'Pants' },
  { id: 'outerwear', name: 'Outerwear', label: 'Outerwear' },
  { id: 'knitwear', name: 'Knitwear', label: 'Knitwear' },
];

export const FABRICS = [
  { id: 'all', name: 'All Fabrics', label: 'All Fabrics' },
  { id: 'cotton', name: 'Cotton', label: 'Cotton' },
  { id: 'linen', name: 'Linen', label: 'Linen' },
  { id: 'silk', name: 'Silk', label: 'Silk' },
  { id: 'wool', name: 'Wool', label: 'Wool' },
  { id: 'cashmere', name: 'Cashmere', label: 'Cashmere' },
];

export const SEASONS = [
  { id: 'all', name: 'All Seasons', label: 'All Seasons' },
  { id: 'spring-summer', name: 'Spring/Summer', label: 'Spring/Summer' },
  { id: 'fall-winter', name: 'Fall/Winter', label: 'Fall/Winter' },
  { id: 'all-season', name: 'All Season', label: 'All Season' },
];

export const STYLES = [
  { id: 'all', name: 'All Styles', label: 'All Styles' },
  { id: 'casual', name: 'Casual', label: 'Casual' },
  { id: 'formal', name: 'Formal', label: 'Formal' },
  { id: 'business', name: 'Business', label: 'Business' },
  { id: 'evening', name: 'Evening', label: 'Evening' },
];

export const BUSINESS_TYPES = [
  { id: 'retailer', name: 'Retailer', label: 'Retailer' },
  { id: 'distributor', name: 'Distributor', label: 'Distributor' },
  { id: 'brand', name: 'Fashion Brand', label: 'Fashion Brand' },
  { id: 'other', name: 'Other', label: 'Other' },
];
