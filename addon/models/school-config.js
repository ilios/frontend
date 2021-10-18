import Model, { belongsTo, attr } from '@ember-data/model';

export default class SchoolConfig extends Model {
  @attr('string')
  name;

  @attr('string')
  value;

  @belongsTo('school', { async: true })
  school;

  get parsedValue() {
    return JSON.parse(this.value ?? null);
  }
}
