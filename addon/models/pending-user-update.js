import Model, { belongsTo, attr } from '@ember-data/model';

export default class PendingUserUpdate extends Model {
  @attr('string')
  type;

  @attr('string')
  property;

  @attr('string')
  value;

  @belongsTo('user', { async: true })
  user;
}
