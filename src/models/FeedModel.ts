export type CardType = 'featured' | 'large' | 'small' | 'showcase';

export type ContentBlockType = 'button' | 'text' | 'image' | 'video';

export interface ContentDetailItem {
  id: string;
  lookup_key?: string | null;
  type: ContentBlockType;
  text?: string | null;
  button_text?: string | null;
  button_color?: string | null;
  button_url?: string | null;
  banner_video?: string | null;
  banner_image?: any | null;
}

export interface CollectionItemModel {
  id: string;
  lookup_key?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image_url?: any | null;
  badge?: string | null;
  content_detail_id?: string | null;
  content_detail?: ContentDetailItem[] | null;
  _raw?: any;
}

export interface FeedModel {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  lookup_key?: string | null;
  is_collection?: boolean | null;
  image?: any | null;
  badge?: string | null;
  card_type?: CardType | string | null;
  collection?: CollectionItemModel[] | any;
}
