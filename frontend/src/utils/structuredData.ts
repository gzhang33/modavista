// 结构化数据生成工具

export interface OrganizationData {
  name: string;
  url: string;
  logo: string;
  description: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  contactPoint: {
    telephone: string;
    contactType: string;
    email: string;
  };
  sameAs: string[];
}

export interface ProductData {
  name: string;
  description: string;
  image: string[];
  brand: string;
  category: string;
  material?: string;
  color?: string;
  offers: {
    priceCurrency: string;
    availability: string;
    itemCondition: string;
    seller: {
      name: string;
      url: string;
    };
  };
}

export interface BreadcrumbData {
  name: string;
  url: string;
}

// 生成组织结构化数据
export function generateOrganizationSchema(data: OrganizationData) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": data.name,
    "url": data.url,
    "logo": data.logo,
    "description": data.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.streetAddress,
      "addressLocality": data.address.addressLocality,
      "addressRegion": data.address.addressRegion,
      "postalCode": data.address.postalCode,
      "addressCountry": data.address.addressCountry
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": data.contactPoint.telephone,
      "contactType": data.contactPoint.contactType,
      "email": data.contactPoint.email
    },
    "sameAs": data.sameAs
  };
}

// 生成产品结构化数据
export function generateProductSchema(data: ProductData) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": data.name,
    "description": data.description,
    "image": data.image,
    "brand": {
      "@type": "Brand",
      "name": data.brand
    },
    "category": data.category,
    "material": data.material,
    "color": data.color,
    "offers": {
      "@type": "Offer",
      "priceCurrency": data.offers.priceCurrency,
      "availability": data.offers.availability,
      "itemCondition": data.offers.itemCondition,
      "seller": {
        "@type": "Organization",
        "name": data.offers.seller.name,
        "url": data.offers.seller.url
      }
    }
  };
}

// 生成面包屑结构化数据
export function generateBreadcrumbSchema(breadcrumbs: BreadcrumbData[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": breadcrumb.name,
      "item": breadcrumb.url
    }))
  };
}

// 生成网站结构化数据
export function generateWebSiteSchema(siteUrl: string, searchUrl?: string) {
  const schema: any = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "DreamModa",
    "url": siteUrl,
    "description": "Premium Italian fashion manufacturer specializing in wholesale garments"
  };

  if (searchUrl) {
    schema.potentialAction = {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": searchUrl
      },
      "query-input": "required name=search_term_string"
    };
  }

  return schema;
}

// 生成本地业务结构化数据
export function generateLocalBusinessSchema(data: OrganizationData) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": data.name,
    "url": data.url,
    "logo": data.logo,
    "description": data.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": data.address.streetAddress,
      "addressLocality": data.address.addressLocality,
      "addressRegion": data.address.addressRegion,
      "postalCode": data.address.postalCode,
      "addressCountry": data.address.addressCountry
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": data.contactPoint.telephone,
      "contactType": data.contactPoint.contactType,
      "email": data.contactPoint.email
    },
    "openingHours": "Mo-Fr 09:00-18:00",
    "priceRange": "$$"
  };
}

// 生成FAQ结构化数据
export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}
