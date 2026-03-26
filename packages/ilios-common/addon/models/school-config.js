import Model, { belongsTo, attr } from '@ember-data/model';

export default class SchoolConfig extends Model {
  @attr('string')
  name;

  @attr('string')
  value;

  @belongsTo('school', { async: true, inverse: 'configurations' })
  school;

  get parsedValue() {
    switch (this.value) {
      case 'false':
        return false;
      case 'true':
        return true;
      default:
        return this.value;
    }
  }
}
