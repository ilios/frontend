import Model, { attr } from '@ember-data/model';

export default class AcademicYear extends Model {
  @attr('string')
  title;
}
