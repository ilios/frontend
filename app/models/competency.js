import DS from 'ember-data';
import Ember from 'ember';

const { computed } = Ember;
const { empty, not } = computed;

export default DS.Model.extend({
  title: DS.attr('string'),
  school: DS.belongsTo('school', {async: true}),
  objectives: DS.hasMany('objective', {async: true}),
  parent: DS.belongsTo('competency', {async: true, inverse: 'children'}),
  children: DS.hasMany('competency', {async: true, inverse: 'parent'}),
  aamcPcrses: DS.hasMany('aamc-pcrs', {async: true}),
  programYears: DS.hasMany('program-year', {async: true}),
  isDomain: empty('parent.content'),
  isNotDomain: not('isDomain'),
  domain: computed('parent', 'parent.domain', function(){
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
  }),
});
