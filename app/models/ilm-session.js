import DS from 'ember-data';

export default DS.Model.extend({
    learnerGroups: DS.hasMany('learner-group', {async: true}),
    instructorGroups: DS.hasMany('instructor-group', {async: true}),
    instructors: DS.hasMany('user', {
        async: true,
        inverse: 'instructorIlmSessions'
      }
    ),
    learners: DS.hasMany('user', {
        async: true,
        inverse: 'learnerIlmSessions'
      }
    ),
    sessions: DS.hasMany('session', {async: true})
});
