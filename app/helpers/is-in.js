import Ember from 'ember';

export function isIn(params) {
  if(params.length < 2){
    return false;
  }

  return params[0].contains(params[1]);
}

export default Ember.Helper.helper(isIn);
