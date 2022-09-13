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
