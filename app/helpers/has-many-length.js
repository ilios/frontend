import Ember from 'ember';

const { isEmpty } = Ember;

export function hasManyLength([model, property]) {
  if(isEmpty(model) || typeof model !== 'object') {
    return model;
  }
  
  if(typeof model.hasMany !== 'function') {
    return model;
  }

  const rel = model.hasMany(property);
  if(typeof rel.ids !== 'function') {
    return model;
  }

  return rel.ids().length;
}

export default Ember.Helper.helper(hasManyLength);
