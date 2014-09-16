import DS from 'ember-data';

export default DS.Model.extend({
  title: DS.attr('string'),
  shortTitle: DS.attr('string'),
  duration: DS.attr('number'),
  isDeleted: DS.attr('boolean'),
  publishedAsTbd: DS.attr('boolean'),
  owningSchool: DS.belongsTo('school'),
  nicePublished: function(){
    return this.get('publishedAsTbd')?'Published':'Not Published';
  }.property('publishedAsTbd')
});
