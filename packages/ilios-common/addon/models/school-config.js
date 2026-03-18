import Model, { belongsTo, attr } from '@ember-data/model';

export default class SchoolConfig extends Model {
  @attr('string')
  name;

  @attr('string')
  value;

  @belongsTo('school', { async: true, inverse: 'configurations' })
  school;

  get parsedValue() {
    try {
      return JSON.parse(this.value ?? null);
    } catch {
      return this.value ?? null;
    }
  }
}
