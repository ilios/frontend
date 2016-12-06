import Ember from 'ember';

export function hasManyLength([model, property]) {
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
