import { get } from '@ember/object';
import { assert } from '@ember/debug';

export function mapBy(arr, path) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  assert('value passed to mapBy is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
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

//stolen from https://github.com/emberjs/ember.js/blob/464e694afd611e2203759e5f76a14c7bfb023006/packages/%40ember/-internals/runtime/lib/mixins/array.ts#L1371
export function sortBy(arr, sortKeys) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  assert('value passed to sortBy is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
  }

  if (!Array.isArray(sortKeys)) {
    sortKeys = [sortKeys];
  }

  return arr.sort((objA, objB) => {
    for (let i = 0; i < sortKeys.length; i++) {
      const key = sortKeys[i];
      const a = get(objA ?? {}, key);
      const b = get(objB ?? {}, key);

      // return 1 or -1 else continue to the next sortKey
      const compareValue = compare(a, b);

      if (compareValue) {
        return compareValue;
      }
    }
    return 0;
  });
}

export function uniqueBy(arr, key) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  assert('value passed to uniqueBy is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
  }

  const seen = new Set();
  const rhett = [];
  arr.forEach((item) => {
    let value;
    if (item === undefined) {
      value = undefined;
    } else if (item === null) {
      value = null;
    } else {
      value = get(item, key);
    }
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
  assert('value passed to uniqueValues is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
  }

  return [...new Set(arr)];
}

export function findBy(arr, key, searchValue) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  assert('value passed to findBy is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
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

export function filterBy(arr, key, searchValue) {
  if (arr !== null && typeof arr === 'object') {
    if ('slice' in arr) {
      arr = arr.slice();
    }
  }
  assert('value passed to filterBy is an array', Array.isArray(arr));
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.filter((item) => {
    if (item === undefined) {
      return false;
    }
    if (item === null) {
      return false;
    }
    const value = get(item, key);
    if (searchValue === undefined) {
      return Boolean(value);
    }

    return searchValue === value;
  });
}

//Stolen from https://github.com/emberjs/ember.js/blob/464e694afd611e2203759e5f76a14c7bfb023006/packages/%40ember/-internals/runtime/lib/compare.ts#L42
function spaceship(a, b) {
  // SAFETY: `Math.sign` always returns `-1` for negative, `0` for zero, and `1`
  // for positive numbers. (The extra precision is useful for the way we use
  // this in the context of `compare`.)
  return Math.sign(a - b);
}

const TYPE_ORDER = {
  undefined: 0,
  null: 1,
  boolean: 2,
  number: 3,
  string: 4,
  array: 5,
  object: 6,
  instance: 7,
  function: 8,
  class: 9,
  date: 10,
  regexp: 11,
  filelist: 12,
  error: 13,
};

// stolen from https://github.com/emberjs/ember.js/blob/464e694afd611e2203759e5f76a14c7bfb023006/packages/%40ember/-internals/runtime/lib/compare.ts#L99
function compare(v, w) {
  if (v === w) {
    return 0;
  }

  const type1 = typeOf(v);
  const type2 = typeOf(w);

  const res = spaceship(TYPE_ORDER[type1], TYPE_ORDER[type2]);

  if (res !== 0) {
    return res;
  }

  // types are equal - so we have to check values now
  switch (type1) {
    case 'boolean':
      assert('both are boolean', typeof v === 'boolean' && typeof w === 'boolean');
      return spaceship(Number(v), Number(w));
    case 'number':
      assert('both are numbers', typeof v === 'number' && typeof w === 'number');
      return spaceship(v, w);
    case 'string':
      assert('both are strings', typeof v === 'string' && typeof w === 'string');
      return spaceship(v.localeCompare(w), 0);
    case 'date':
      assert('both are dates', v instanceof Date && w instanceof Date);
      return spaceship(v.getTime(), w.getTime());

    default:
      return 0;
  }
}

const TYPE_MAP = {
  '[object Boolean]': 'boolean',
  '[object Number]': 'number',
  '[object String]': 'string',
  '[object Function]': 'function',
  '[object AsyncFunction]': 'function',
  '[object Array]': 'array',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Object]': 'object',
  '[object FileList]': 'filelist',
};

const { toString } = Object.prototype;

// stolen from https://github.com/emberjs/ember.js/blob/464e694afd611e2203759e5f76a14c7bfb023006/packages/%40ember/-internals/runtime/lib/type-of.ts#L101
function typeOf(item) {
  if (item === null) {
    return 'null';
  }
  if (item === undefined) {
    return 'undefined';
  }
  const ret = TYPE_MAP[toString.call(item)] || 'object';

  if (ret === 'object' && item instanceof Date) {
    return 'date';
  }

  return ret;
}
