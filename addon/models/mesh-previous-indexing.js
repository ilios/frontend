import Model, { belongsTo, attr } from '@ember-data/model';

export default class MeshPreviousIndexing extends Model {
  @attr('string')
  previousIndexing;

  @belongsTo('mesh-descriptor', { async: true })
  descriptor;
}
