import Model, { hasMany, attr } from '@ember-data/model';

export default class MeshQualifier extends Model {
  @attr('string')
  name;

  @attr('date')
  createdAt;

  @attr('date')
  updatedAt;

  @hasMany('mesh-descriptor', { async: true })
  descriptors;
}
