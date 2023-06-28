import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  session: belongsTo('session', { inverse: 'sessionObjectives' }),
  terms: hasMany('session', { inverse: 'sessionObjectives' }),
  meshDescriptors: hasMany('mesh-descriptor', { inverse: 'sessionObjectives' }),
  ancestor: belongsTo('session-objective', { inverse: 'descendants' }),
  descendants: hasMany('session-objective', { inverse: 'ancestor' }),
  courseObjectives: hasMany('course-objective', { inverse: 'sessionObjectives' }),
});
