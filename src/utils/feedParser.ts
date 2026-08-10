import { FeedModel, CollectionItemModel } from '../models/FeedModel';
import { toList, resolveString, resolveRelationId } from './contentBlockParser';

function resolveCardType(rawType: any): 'featured' | 'large' | 'small' {
  const t = resolveString(rawType).toLowerCase();
  if (t === 'featured' || t === 'large' || t === 'small') { return t; }
  return 'large';
}

export function parseCollectionItem(raw: any): CollectionItemModel {
  const rawDetail = raw.content_detail ?? raw.content ?? null;
  const detailId = rawDetail?.id ?? resolveRelationId(rawDetail) ?? null;

  return {
    id: raw.id ?? '',
    lookup_key: resolveString(raw.lookup_key) || null,
    title: resolveString(raw.title) || null,
    subtitle: resolveString(raw.subtitle) || null,
    body: resolveString(raw.body) || null,
    image_url: raw.image_url ?? raw.image ?? null,
    badge: resolveString(raw.badge) || null,
    content_detail_id: detailId ? String(detailId) : null,
    content_detail: rawDetail,
    _raw: raw,
  };
}

export function buildSections(raw: any): FeedModel[] {
  const entries = toList(raw).sort(
    (a, b) => (a.display_order ?? 0) - (b.display_order ?? 0),
  );

  const featuredItems: CollectionItemModel[] = [];
  const nonFeatured: FeedModel[] = [];

  entries.forEach((entry) => {
    const cardType = resolveCardType(entry.card_type);
    const items = toList(entry.carousel).map(parseCollectionItem);

    if (cardType === 'featured') {
      featuredItems.push(...items);
    } else {
      nonFeatured.push({
        id: entry.id,
        title: resolveString(entry.title) || null,
        subtitle: resolveString(entry.subtitle) || null,
        card_type: cardType,
        is_collection: !!entry.is_collection,
        collection: entry.is_collection ? items : [parseCollectionItem(entry)],
      });
    }
  });

  const result: FeedModel[] = [];

  if (featuredItems.length > 0) {
    result.push({
      id: 'featured-merged',
      title: null,
      subtitle: null,
      card_type: 'featured',
      is_collection: true,
      collection: featuredItems,
    });
  }

  result.push(...nonFeatured);
  return result;
}
