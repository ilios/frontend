import { helper } from '@ember/component/helper';
import { isEmpty, typeOf } from '@ember/utils';

export function countRelated(params) {
  if (typeOf(params) !== 'array' || params.length < 2) {
    return false;
  }
  let object = params[0];
  let what = params[1];

  if (isEmpty(what) || isEmpty(object)) {
    return false;
  }

  if (typeOf(object.hasMany) != 'function') {
    return false;
  }


  return object.hasMany(what).ids().length;
}

export default helper(countRelated);
