import Model, { hasMany, attr } from '@ember-data/model';

export default class AamcMethod extends Model {
  @attr('string')
  description;

  @hasMany('session-type', { async: true })
  sessionTypes;

  @attr('boolean')
  active;
}
