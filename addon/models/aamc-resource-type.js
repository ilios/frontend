import Model, { hasMany, attr } from '@ember-data/model';

export default class AamcResourceType extends Model {
  @attr('string')
  title;

  @attr('string')
  description;

  @hasMany('term', { async: true })
  competencies;
}
