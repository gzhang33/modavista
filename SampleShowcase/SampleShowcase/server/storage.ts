import { type Product, type InsertProduct, type Inquiry, type InsertInquiry } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Products
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getFeaturedProducts(): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  filterProducts(filters: {
    category?: string;
    fabric?: string;
    season?: string;
    style?: string;
  }): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getInquiries(): Promise<Inquiry[]>;
}

export class MemStorage implements IStorage {
  private products: Map<string, Product>;
  private inquiries: Map<string, Inquiry>;

  constructor() {
    this.products = new Map();
    this.inquiries = new Map();
    this.seedProducts();
  }

  private seedProducts() {
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Cotton Dress Shirt",
        description: "Classic tailored fit with mother-of-pearl buttons and exceptional attention to detail",
        category: "shirts",
        fabric: "100% Egyptian Cotton",
        style: "formal",
        season: "all-season",
        care: "Machine wash cold, hang to dry",
        origin: "Made in Italy",
        sku: "AT001",
        images: ["https://images.unsplash.com/photo-1564859228273-274232fdb516?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Collar": "Spread collar",
          "Cuffs": "Barrel cuffs",
          "Buttons": "Mother-of-pearl",
          "Fit": "Tailored"
        },
        featured: "yes"
      },
      {
        name: "Elegant Midi Dress",
        description: "Sophisticated A-line silhouette with subtle pleating and timeless appeal",
        category: "dresses",
        fabric: "Ponte Knit Blend",
        style: "business",
        season: "spring-summer",
        care: "Dry clean only",
        origin: "Made in Italy",
        sku: "AT002",
        images: ["https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Length": "Midi",
          "Silhouette": "A-line",
          "Details": "Subtle pleating",
          "Closure": "Back zip"
        },
        featured: "yes"
      },
      {
        name: "Tailored Wool Blazer",
        description: "Contemporary cut with notched lapels and structured shoulders",
        category: "outerwear",
        fabric: "Pure Wool",
        style: "formal",
        season: "fall-winter",
        care: "Dry clean only",
        origin: "Made in Italy",
        sku: "AT003",
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Lapels": "Notched",
          "Shoulders": "Structured",
          "Buttons": "Horn buttons",
          "Pockets": "Flap pockets"
        },
        featured: "yes"
      },
      {
        name: "Linen Casual Pants",
        description: "Relaxed fit with adjustable waistband and comfortable drape",
        category: "pants",
        fabric: "100% Linen",
        style: "casual",
        season: "spring-summer",
        care: "Machine wash cold, line dry",
        origin: "Made in Portugal",
        sku: "AT004",
        images: ["https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Fit": "Relaxed",
          "Waistband": "Adjustable",
          "Pockets": "Side and back pockets",
          "Inseam": "30 inches"
        },
        featured: "yes"
      },
      {
        name: "Cashmere Crew Sweater",
        description: "Luxurious soft knit with ribbed trim and classic fit",
        category: "knitwear",
        fabric: "100% Cashmere",
        style: "casual",
        season: "fall-winter",
        care: "Hand wash cold, lay flat to dry",
        origin: "Made in Scotland",
        sku: "AT005",
        images: ["https://images.unsplash.com/photo-1578587018452-892bacefd3f2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Neckline": "Crew neck",
          "Trim": "Ribbed",
          "Fit": "Classic",
          "Weight": "Lightweight"
        },
        featured: "yes"
      },
      {
        name: "Silk Button-Down Blouse",
        description: "Fluid drape with hidden button placket and elegant silhouette",
        category: "shirts",
        fabric: "100% Mulberry Silk",
        style: "business",
        season: "all-season",
        care: "Dry clean only",
        origin: "Made in Italy",
        sku: "AT006",
        images: ["https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=1000"],
        specifications: {
          "Placket": "Hidden buttons",
          "Drape": "Fluid",
          "Collar": "Point collar",
          "Cuffs": "Button cuffs"
        },
        featured: "yes"
      }
    ];

    sampleProducts.forEach(product => {
      const id = randomUUID();
      this.products.set(id, { ...product, id });
    });
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.category === category
    );
  }

  async getFeaturedProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      product => product.featured === "yes"
    );
  }

  async searchProducts(query: string): Promise<Product[]> {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.products.values()).filter(
      product =>
        product.name.toLowerCase().includes(lowercaseQuery) ||
        product.description.toLowerCase().includes(lowercaseQuery) ||
        product.fabric.toLowerCase().includes(lowercaseQuery) ||
        product.category.toLowerCase().includes(lowercaseQuery)
    );
  }

  async filterProducts(filters: {
    category?: string;
    fabric?: string;
    season?: string;
    style?: string;
  }): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => {
      if (filters.category && product.category !== filters.category) return false;
      if (filters.fabric && !product.fabric.toLowerCase().includes(filters.fabric.toLowerCase())) return false;
      if (filters.season && product.season !== filters.season) return false;
      if (filters.style && product.style !== filters.style) return false;
      return true;
    });
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = randomUUID();
    const inquiry: Inquiry = { ...insertInquiry, id };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }

  async getInquiries(): Promise<Inquiry[]> {
    return Array.from(this.inquiries.values());
  }
}

export const storage = new MemStorage();
