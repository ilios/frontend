import DS from 'ember-data';
import Ember from 'ember';

export default DS.Model.extend({
  title: DS.attr('string'),
  owningSchool: DS.belongsTo('school'),
  parent: DS.belongsTo('competency', {async: true, inverse: 'children'}),
  children: DS.hasMany('competency', {async: true, inverse: 'parent'}),
  objectives: DS.hasMany('objective',  {async: true}),
  aamcPcrses: DS.hasMany('aamc-pcrs',  {async: true}),
  programYears: DS.hasMany('program-year',  {async: true}),
  courses: DS.hasMany('course',  {async: true}),
  isDomain: Ember.computed.empty('parent.id'),
  domain: null,
  watchParent: function(){
    var competency = this;
    if(this.get('isDomain')){
      this.set('domain', this);
    } else {
      this.get('parent').then(function(parent){
        if(parent != null){
          competency.set('domain', parent.get('domain'));
        }
      });
    }
  }.observes('isDomain', 'parent.domain').on('init'),
});
