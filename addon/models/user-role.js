import Model, { attr } from '@ember-data/model';

export default class UserRole extends Model {
  @attr('string')
  title;
}
