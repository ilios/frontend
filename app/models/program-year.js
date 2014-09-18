/* global moment */
import DS from 'ember-data';

export default DS.Model.extend({
  startYear: DS.attr('date'),
  deleted: DS.attr('boolean'),
  locked: DS.attr('boolean'),
  archived: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  program: DS.belongsTo('program'),
  directors: DS.hasMany('user', {async: true}),
  competencies: DS.hasMany('competency', {async: true}),
  disciplines: DS.hasMany('discipline', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  academicYear: function(){
    var str = moment(this.get('startYear')).format('YYYY');
    str += ' - ';
    str += moment(this.get('startYear')).add(1, 'year').format('YYYY');
    return str;
  }.property('startYear'),
  nicePublished: function(){
    return this.get('publishedAsTbd')?'Published':'Not Published';
  }.property('publishedAsTbd')
});
