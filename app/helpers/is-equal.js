import Ember from 'ember';

export function isEqual(params) {
  if(params.length < 2){
    return false;
  }

  return params[0] === params[1];
}

export default Ember.HTMLBars.makeBoundHelper(isEqual);
