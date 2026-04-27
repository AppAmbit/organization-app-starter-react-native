export function resolveImageUri(raw: any): string {
  if (!raw) return '';
  
  if (typeof raw === 'string') return raw;

  const item = Array.isArray(raw) ? raw[0] : raw;
  if (!item) return '';

  if (typeof item === 'string') return item;

  const url = item.url || item.uri || item.src || item.file_url;
  if (url && typeof url === 'string') return url;

  if (item.data) {
    const dataItem = Array.isArray(item.data) ? item.data[0] : item.data;
    if (dataItem?.url && typeof dataItem.url === 'string') return dataItem.url;
  }

  if (item.file?.url && typeof item.file.url === 'string') {
    return item.file.url;
  }

  return '';
}
