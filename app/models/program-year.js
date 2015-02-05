import DS from 'ember-data';

export default DS.Model.extend({
  startYear: DS.attr('string'),
  deleted: DS.attr('boolean'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  program: DS.belongsTo('program', {async: true}),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewardingSchools: DS.hasMany('school', {async: true}),
  cohort: DS.belongsTo('cohort', {async: true}),
  publishEvent: DS.belongsTo('publish-event', {async: true}),
  academicYear: function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'))+1);
  }.property('startYear'),
  classOfYear: function(){
    return (parseInt(this.get('startYear'))+parseInt(this.get('program.duration')));
  }.property('startYear', 'program.duration')
});
