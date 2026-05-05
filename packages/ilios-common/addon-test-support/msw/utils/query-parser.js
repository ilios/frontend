import qs from 'qs';

// Parses Ilios-specific query parameters: filters[field], limit/offset, and search queries
export function parseQueryParams(searchParams) {
  const parsedParameters = qs.parse(searchParams);

  return {
    filterParams: parsedParameters.filters ?? [],
    queryTerms: parsedParameters.q?.split(' ').filter(Boolean) ?? [],
    limit: Number(parsedParameters.limit ?? 100000), // Match Mirage default
    offset: Number(parsedParameters.offset ?? 0),
    include: parsedParameters.include ?? null,
  };
}

export function applyFilters(data, filterParams) {
  if (!filterParams || filterParams.length === 0) {
    return data;
  }

  return data.filter((item) => {
    // Item must match ALL filters
    return filterParams.every((filter) => {
      const { param, value } = filter;
      const itemValue = item[param];

      // Handle array filters: filters[id]=[1,2,3]
      if (Array.isArray(value)) {
        if (Array.isArray(itemValue)) {
          return itemValue.some((v) => value.includes(String(v.id || v)));
        }
        if (itemValue && typeof itemValue === 'object') {
          return value.includes(String(itemValue.id));
        }
        return value.includes(String(itemValue));
      }

      // Handle empty filters: filters[sessions]= (empty courses)
      if (value === '') {
        if (Array.isArray(itemValue)) {
          return itemValue.length === 0;
        }
        return !itemValue;
      }

      // Handle null filter: filters[field]=null
      if (value === 'null') {
        return itemValue === null || itemValue === undefined;
      }

      // Handle relationship filters
      if (itemValue && typeof itemValue === 'object') {
        return String(itemValue.id) === String(value);
      }

      // Simple equality
      return String(itemValue) === String(value);
    });
  });
}

export function applyPagination(data, limit, offset) {
  const paginated = data.slice(offset, offset + limit);

  return {
    data: paginated,
    meta: {
      total: data.length,
      limit,
      offset,
    },
  };
}

export default parseQueryParams;
