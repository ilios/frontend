import Model, { attr,hasMany } from '@ember-data/model';

export default class CourseClerkshipType extends Model {
  @attr('string')
  title;

  @hasMany('course', { async: true, inverse: 'clerkshipType' })
  courses;
}
