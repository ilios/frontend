import { get } from '@ember/object';
import { DateTime } from 'luxon';

export function mapBy(arr, path) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  if (!Array.isArray(arr)) {
    return arr;
  }
  return arr.map((item) => {
    if (item === undefined) {
      return undefined;
    }
    if (item === null) {
      return null;
    }

    return get(item, path);
  });
}

export function sortByString(arr, path) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.sort((objA, objB) => {
    const a = get(objA ?? {}, path);
    const b = get(objB ?? {}, path);

    if (a === b) {
      return 0;
    }

    if (a === undefined || a === null) {
      return 1;
    }

    if (b === undefined || b === null) {
      return -1;
    }

    return a.localeCompare(b);
  });
}

export function sortByDate(arr, path) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.sort((objA, objB) => {
    const a = get(objA ?? {}, path);
    const b = get(objB ?? {}, path);

    if (a === b) {
      return 0;
    }

    if (a === undefined || a === null) {
      return 1;
    }

    if (b === undefined || b === null) {
      return -1;
    }
    const d1 = DateTime.fromJSDate(a);
    const d2 = DateTime.fromJSDate(b);

    return d1.toMillis() - d2.toMillis();
  });
}

export function sortByNumber(arr, path) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.sort((objA, objB) => {
    const a = get(objA ?? {}, path);
    const b = get(objB ?? {}, path);

    if (a === b) {
      return 0;
    }

    if (a === undefined || a === null) {
      return 1;
    }

    if (b === undefined || b === null) {
      return -1;
    }

    return a - b;
  });
}

export function uniqueBy(arr, key) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  const seen = new Set();
  const rhett = [];
  arr.forEach((item) => {
    if (item === undefined) {
      rhett.push(undefined);
      return;
    }
    if (item === null) {
      rhett.push(null);
      return;
    }

    const value = get(item, key);
    if (seen.has(value)) {
      return;
    }
    seen.add(value);
    rhett.push(item);
  });
  return rhett;
}

export function uniqueById(arr) {
  return uniqueBy(arr, 'id');
}

export function uniqueValues(arr) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  return [...new Set(arr)];
}

export function findBy(arr, key, searchValue) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }

  if (!Array.isArray(arr)) {
    return arr;
  }

  return arr.find((item) => {
    if (item === undefined) {
      return false;
    }
    if (item === null) {
      return false;
    }
    return get(item, key) === searchValue;
  });
}

export function findById(arr, id) {
  return findBy(arr, 'id', id);
}
