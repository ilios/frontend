import Model, { hasMany, attr } from '@ember-data/model';

export default class AamcMethod extends Model {
  @attr('string')
  description;

  @hasMany('session-type', { async: true, inverse: 'aamcMethods' })
  sessionTypes;

  @attr('boolean')
  active;
}
