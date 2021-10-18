import Model, { hasMany, attr } from '@ember-data/model';

export default class AamcPcrs extends Model {
  @attr('string')
  description;

  @hasMany('competency', { async: true })
  competencies;
}
