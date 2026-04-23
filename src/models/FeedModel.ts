export type CardType = 'featured' | 'large' | 'small' | 'showcase';

export interface FeedModel {

  id: string;
  display_order: number;
  item_order: number;
  module_title?: string | null;
  module_subtitle?: string | null;
  card_type: CardType;
  enabled?: boolean | null;
  see_all_label?: string | null;
  see_all_action?: string | null;
  card_title?: string | null;
  card_subtitle?: string | null;
  module_image?: any | null;
  module_image_url?: string | null;
  tap_action?: string | null;
}
