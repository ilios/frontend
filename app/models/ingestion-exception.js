import Model, { attr,belongsTo } from '@ember-data/model';

export default class IngestionException extends Model {
  @attr('string')
  uid;

  @belongsTo('user', { async: true, inverse: 'ingestionExceptions' })
  user;
}
