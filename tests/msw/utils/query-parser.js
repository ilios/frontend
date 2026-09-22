import qs from 'qs';

// Parses Ilios-specific query parameters: filters[field], limit/offset, and search queries
export function parseQueryParams(searchParams) {
  const parsedParameters = qs.parse(searchParams, { arrayLimit: 100, throwOnLimitExceeded: true });

  return {
    filterParams: parsedParameters.filters ?? {},
    queryTerms: parsedParameters.q?.split(' ').filter(Boolean) ?? [],
    limit: Number(parsedParameters.limit ?? 100000), // Match Mirage default
    offset: Number(parsedParameters.offset ?? 0),
    include: parsedParameters.include ?? null,
  };
}
