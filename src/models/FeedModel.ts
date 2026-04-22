export type CardType = 'featured' | 'large' | 'small';

export interface FeedModel {
  id: string;
  display_order: number;
  module_title?: string | null;
  module_subtitle?: string | null;
  module_image?: string | null;
  module_image_url?: string | null;
  card_type: CardType;
  enabled?: boolean | null;
  source_content_type: string;
  title_field?: string | null;
  subtitle_field?: string | null;
  image_field?: string | null;
  category_field?: string | null;
  content_date_field?: string | null;
  max_items?: number | null;
}
