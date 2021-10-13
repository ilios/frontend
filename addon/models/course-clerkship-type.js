import Model, { hasMany, attr } from '@ember-data/model';

export default class CourseClerkshipType extends Model {
  @attr('string')
  title;

  @hasMany('course', { async: true })
  courses;
}
