import Model, { hasMany, attr } from '@ember-data/model';

export default class MeshTerm extends Model {
  @attr('string')
  meshTermUid;

  @attr('string')
  name;

  @attr('string')
  lexicalTag;

  @attr('string')
  conceptPreferred;

  @attr('string')
  recordPreferred;

  @attr('string')
  permuted;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  @hasMany('mesh-concept', { async: true })
  concepts;
}
