import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  clerkshipType: belongsTo('course-clerkship-type', { inverse: 'courses' }),
  school: belongsTo('school', { inverse: 'courses' }),
  directors: hasMany('user', { inverse: 'directedCourses' }),
  administrators: hasMany('user', { inverse: 'administeredCourses' }),
  studentAdvisors: hasMany('user', { inverse: 'studentAdvisedCourses' }),
  cohorts: hasMany('cohort', { inverse: 'courses' }),
  courseObjectives: hasMany('course-objective', { inverse: 'course' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'courses' }),
  learningMaterials: hasMany('course-learning-material', { inverse: 'course' }),
  sessions: hasMany('session', { inverse: 'course' }),
  ancestor: belongsTo('course', { inverse: 'descendants' }),
  descendants: hasMany('course', { inverse: 'ancestor' }),
  terms: hasMany('term', { inverse: 'courses' }),
});
