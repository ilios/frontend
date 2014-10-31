module.exports = function(app) {
  var fixtures = [
      {
        id: 0,
        title: 'First Test Group',
        location: '',
        cohort: 0,
        parent: null,
        children: [2,3],
        users: [0,1],
        instructors: [1],
        instructorGroups: [0],
        offerings: null
      },
      {
        id: 1,
        title: 'Second Test Group',
        location: '',
        cohort: 0,
        parent: null,
        children: [],
        users: [0],
        instructors: [1],
        instructorGroups: [0],
        offerings: null
      },
      {
        id: 2,
        title: 'First Test Sub-Group',
        location: '',
        cohort: 0,
        parent: 0,
        children: [],
        users: [2],
        instructors: [],
        instructorGroups: [],
        offerings: null
      },
      {
        id: 3,
        title: 'Second Test Sub-Group',
        location: '',
        cohort: 0,
        parent: 0,
        children: [],
        users: [2],
        instructors: [],
        instructorGroups: [],
        offerings: null
      },
  ];
  var createRouter = require('../helpers/createrouter.js');
  var router = createRouter('learnerGroup', fixtures);
  app.use('/api/learnergroups', router);
};


// import DS from 'ember-data';
//
// export default DS.Model.extend({
//   title: DS.attr('string'),
//   location: DS.attr('string'),
//   cohort: DS.belongsTo('cohort', {async: true}),
//   parent: DS.belongsTo('learner-group', {async: true, inverse: 'children'}),
//   children: DS.hasMany('learner-group', {async: true, inverse: 'parent'}),
//   users: DS.hasMany('user', {async: true}),
//   instructors: DS.hasMany('user', {async: true}),
//   instructorGroups: DS.hasMany('instructor-group', {async: true}),
//   offerings: DS.hasMany('offering', {async: true}),
// });
