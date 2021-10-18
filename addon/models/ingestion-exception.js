import Model, { belongsTo, attr } from '@ember-data/model';

export default class IngestionException extends Model {
  @attr('string')
  uid;

  @belongsTo('user', { async: true })
  user;
}
