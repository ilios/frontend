import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  sessionType: belongsTo('session-type', { inverse: 'sessions' }),
  course: belongsTo('course', { inverse: 'sessions' }),
  ilmSession: belongsTo('ilm-session', { inverse: 'session' }),
  sessionObjectives: hasMany('session-objective', { inverse: 'session' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'sessions' }),
  learningMaterials: hasMany('session-learning-material', { inverse: 'session' }),
  offerings: hasMany('offering', { inverse: 'session' }),
  administrators: hasMany('user', {
    inverse: 'administeredSessions',
  }),
  studentAdvisors: hasMany('user', {
    inverse: 'studentAdvisedSessions',
  }),
  postrequisite: belongsTo('session', {
    inverse: 'prerequisites',
  }),
  prerequisites: hasMany('session', {
    inverse: 'postrequisite',
  }),
  terms: hasMany('term', { inverse: 'sessions' }),
});
