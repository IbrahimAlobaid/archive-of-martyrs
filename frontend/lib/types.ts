export type Village = {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  created_at: string;
};

export type GalleryImage = {
  id: number;
  image_url: string;
  public_id: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type MartyrListItem = {
  id: number;
  full_name: string;
  slug: string;
  main_image_url: string | null;
  martyrdom_date: string;
  age: number | null;
  short_bio: string | null;
  is_featured: boolean;
  is_published: boolean;
  village: Village;
};

export type Martyr = MartyrListItem & {
  birth_date: string | null;
  full_story: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  gallery_images: GalleryImage[];
};

export type MartyrStats = {
  total_martyrs: number;
  villages_represented: number;
  latest_added_name: string | null;
  latest_added_date: string | null;
};

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
};

export type SubmissionStatus = "pending" | "reviewed" | "approved" | "rejected";

export type Submission = {
  id: number;
  martyr_id: number | null;
  submitter_name: string | null;
  submitter_email: string | null;
  message: string;
  status: SubmissionStatus;
  created_at: string;
  reviewed_at: string | null;
};
