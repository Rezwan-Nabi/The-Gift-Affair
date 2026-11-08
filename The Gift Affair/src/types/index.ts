export type TagType = "occasion" | "recipient" | "budget";
export type ContentStatus = "draft" | "published" | "archived";
export type Role = "admin" | "editor";

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imagePath: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
  tagType: TagType;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

export type GiftImage = {
  id?: string;
  path: string;
  alt: string;
  sortOrder: number;
};

export type Gift = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  whyThoughtful: string | null;
  keywords: string | null;
  mainImagePath: string | null;
  imageAlt: string | null;
  priceAmount: number | null;
  currency: string | null;
  /** When the price was last checked against the source. Required to show a price. */
  priceCheckedAt: string | null;
  externalUrl: string | null;
  sourceName: string | null;
  isFeatured: boolean;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
  tags: Tag[];
  images: GiftImage[];
};

export type Guide = {
  id: string;
  title: string;
  slug: string;
  introduction: string;
  content: string;
  coverImagePath: string | null;
  coverImageAlt: string | null;
  status: ContentStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Curated gifts, in display order. */
  gifts: Gift[];
};

export type GiftSort = "featured" | "newest";

export type GiftFilters = {
  q: string;
  category: string;
  occasion: string;
  recipient: string;
  budget: string;
  sort: GiftSort;
  page: number;
};

export type GiftListResult = {
  gifts: Gift[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
};

export type Taxonomy = {
  categories: Category[];
  occasions: Tag[];
  recipients: Tag[];
  budgets: Tag[];
};
