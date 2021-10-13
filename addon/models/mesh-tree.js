import Model, { belongsTo, attr } from '@ember-data/model';

export default class MeshTree extends Model {
  @attr('string')
  treeNumber;

  @belongsTo('mesh-descriptor', { async: true })
  descriptor;
}
