export const tokenizeSearch = (text) => {
  if (!text) return [];
  return text
    .toString()
    .toLowerCase()
    .split(/[\s,.;:!?()+/-]+/)
    .filter(Boolean);
};

export const matchesSearchTokens = (product, tokens) => {
  if (!tokens.length || !product) return false;

  const nameField = (product.name || product.title || '').toLowerCase();
  const descriptionField = (product.description || '').toLowerCase();
  const eanField = (product.ean || '').toString().toLowerCase();
  const ids = [product.originalId, product.id]
    .filter(Boolean)
    .map((id) => id.toString().toLowerCase());

  const hasMatch = (haystack) => tokens.some((token) => haystack.includes(token));

  if (nameField && hasMatch(nameField)) return true;
  if (descriptionField && hasMatch(descriptionField)) return true;
  if (eanField && hasMatch(eanField)) return true;

  return ids.some((id) => hasMatch(id));
};

export const filterProductsBySearch = (products, query) => {
  const tokens = tokenizeSearch(query);
  if (!tokens.length) return products;
  return products.filter((product) => matchesSearchTokens(product, tokens));
};

