export function cleanQuery(query) {
  if (typeof query != 'string') {
    return '';
  }
  return query.trim().replace(/[-,?~!@#$%&*+'="]/g, ' ');
}
