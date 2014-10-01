import DS from 'ember-data';

export default DS.Model.extend({
  startYear: DS.attr('string'),
  deleted: DS.attr('boolean'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  program: DS.belongsTo('program'),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  topics: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  stewardingSchools: DS.hasMany('school', {async: true}),
  academicYear: function(){
    return this.get('startYear') + ' - ' + (parseInt(this.get('startYear'))+1);
  }.property('startYear')
});
