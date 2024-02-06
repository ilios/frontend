import { Model, belongsTo, hasMany } from 'miragejs';

export default Model.extend({
  assessmentOption: belongsTo('assessment-option', { inverse: 'sessionTypes' }),
  school: belongsTo('school', { inverse: 'sessionTypes' }),
  aamcMethods: hasMany('aamc-method', { inverse: 'sessionTypes' }),
  sessions: hasMany('session', { inverse: 'sessionType' }),
});
