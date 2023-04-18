import Model, { belongsTo, attr } from '@ember-data/model';

export default class Authentication extends Model {
  @attr('string')
  password;

  @attr('string')
  username;

  @belongsTo('user', { async: true, inverse: 'authentication' })
  user;
}
