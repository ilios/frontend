import { helper } from '@ember/component/helper';

export default helper(function hasManyIds([model, property]) {
  if(!model || typeof model !== 'object') {
    return [];
  }

  if(typeof model.hasMany !== 'function') {
    return [];
  }

  const rel = model.hasMany(property);
  if(typeof rel.ids !== 'function') {
    return [];
  }

  return rel.ids();
});
