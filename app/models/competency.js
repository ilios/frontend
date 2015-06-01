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
  isDomain: Ember.computed.empty('parent.content'),
  domain: function(){
    let promise = new Ember.RSVP.Promise(
      resolve => {
        this.get('parent').then(
          parent => {
            if(!parent){
              resolve(this);
            } else {
              parent.get('domain').then(
                domain => resolve(domain)
              );
            }
          }
        );
      }
    );
    return DS.PromiseObject.create({
      promise: promise
    });
  }.property('parent','parent.domain'),
});
