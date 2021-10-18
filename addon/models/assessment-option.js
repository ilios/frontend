import Model, { hasMany, attr } from '@ember-data/model';

export default class AssessmentOption extends Model {
  @attr('string')
  name;

  @hasMany('session-type', { async: true })
  sessionTypes;
}
