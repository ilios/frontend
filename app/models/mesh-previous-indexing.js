import Model, { attr,belongsTo } from '@ember-data/model';

export default class MeshPreviousIndexing extends Model {
  @attr('string')
  previousIndexing;

  @belongsTo('mesh-descriptor', { async: true, inverse: 'previousIndexing' })
  descriptor;
}
