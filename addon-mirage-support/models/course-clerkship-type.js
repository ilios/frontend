import { Model, hasMany } from 'miragejs';

export default Model.extend({
  courses: hasMany('course', { inverse: 'clerkshipType' }),
});
