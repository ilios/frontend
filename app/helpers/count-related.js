import Ember from 'ember';

const { typeOf, isEmpty } = Ember;

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

export default Ember.Helper.helper(countRelated);
