// Removes dangerous keys (starting with "$" or containing ".") from request data to block MongoDB injection.
const clean = (value) => {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, v]) => [key, clean(v)])
    );
  }
  return value;
};

export const sanitize = (req, res, next) => {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  // req.query is read-only in some setups, so clean it key by key.
  if (req.query) {
    const cleaned = clean(req.query);
    Object.keys(req.query).forEach((k) => { if (!(k in cleaned)) delete req.query[k]; else req.query[k] = cleaned[k]; });
  }
  next();
};
