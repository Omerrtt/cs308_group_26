export const tokenizeSearch = (text) => {
  if (!text) return [];
  return text
    .toString()
    .toLowerCase()
    .split(/[\s,.;:!?()+/-]+/)
    .filter(Boolean);
};

const getSearchableFields = (product) => {
  if (!product) return [];

  const nameField = (product.name || product.title || '').toLowerCase();
  const descriptionField = (product.description || '').toLowerCase();
  const eanField = (product.ean || '').toString().toLowerCase();
  const ids = [product.originalId, product.id]
    .filter(Boolean)
    .map((id) => id.toString().toLowerCase());

  return [
    nameField,
    descriptionField,
    eanField,
    ...ids,
  ].filter(Boolean);
};

const tokenExistsInFields = (token, fields) =>
  fields.some((field) => field.includes(token));

export const matchesAnySearchToken = (product, tokens) => {
  if (!tokens.length || !product) return false;

  const fields = getSearchableFields(product);
  return tokens.some((token) => tokenExistsInFields(token, fields));
};

export const matchesAllSearchTokens = (product, tokens) => {
  if (!tokens.length || !product) return false;

  const fields = getSearchableFields(product);
  return tokens.every((token) => tokenExistsInFields(token, fields));
};

export const filterProductsBySearch = (products, query) => {
  const tokens = tokenizeSearch(query);
  if (!tokens.length) return products;

  const strictMatches = products.filter((product) =>
    matchesAllSearchTokens(product, tokens)
  );

  if (strictMatches.length) {
    return strictMatches;
  }

  return products.filter((product) =>
    matchesAnySearchToken(product, tokens)
  );
};

