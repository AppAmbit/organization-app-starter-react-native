// CMS collection names used in this app:
//   feed_carousel       → list of feed sections (top-level)
//   carousel_items      → individual cards within a section
//   content_details     → content groups that reference ordered entry_ids
//   content_detail_items → actual renderable blocks (text / image / video / button)

export type CardType = 'featured' | 'large' | 'small' | 'showcase';

export type ContentBlockType = 'button' | 'text' | 'image' | 'video';

/** A single renderable block coming from `content_detail_items` */
export interface ContentDetailItem {
  id: string;
  lookup_key?: string | null;
  type: ContentBlockType;
  text?: string | null;
  button_text?: string | null;
  button_color?: string | null;
  button_url?: string | null;
  banner_video?: string | null;
  /** Raw filename (e.g. "dc95e19b-...jpg") – prefer banner_image_url when available */
  banner_image?: any | null;
  /** Full URL resolved by the CMS */
  banner_image_url?: string | null;
}

/**
 * Shape of an inline `content_detail` object that may already contain
 * either resolved blocks or a list of {entry_id} references.
 */
export interface ContentDetailRef {
  id: string;
  title?: string | null;
  content?: Array<{ entry_id: string } | ContentDetailItem>;
}

/** An item coming from `carousel_items` (or from a section's `carousel` array) */
export interface CollectionItemModel {
  id: string;
  lookup_key?: string | null;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  image_url?: any | null;
  badge?: string | null;
  /** Id of the related `content_details` record */
  content_detail_id?: string | null;
  /** Inline `content_detail` object (may be partial / reference list) */
  content_detail?: ContentDetailRef | null;
  _raw?: any;
}

/** A feed section built from `feed_carousel` entries */
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
