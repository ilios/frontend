import DS from 'ember-data';
import Ember from 'ember';

const { computed, RSVP } = Ember;
const { empty, not } = computed;
const { Promise, all } = RSVP;
const { Model, attr, belongsTo, hasMany } = DS;

export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', {async: true}),
  objectives: hasMany('objective', {async: true}),
  parent: belongsTo('competency', {async: true, inverse: 'children'}),
  children: hasMany('competency', {async: true, inverse: 'parent'}),
  aamcPcrses: hasMany('aamc-pcrs', {async: true}),
  programYears: hasMany('program-year', {async: true}),
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
  treeChildren: computed('children.[]', function(){
    return new Promise(resolve => {
      let rhett = [];
      this.get('children').then(children => {
        rhett.pushObjects(children.toArray());
        all(children.mapBy('treeChildren')).then(trees => {
          let competencies = trees.reduce(function(array, set){
            return array.pushObjects(set.toArray());
          }, []);
          rhett.pushObjects(competencies);
          rhett = rhett.uniq().filter(function(item){
            return item != null;
          });
          resolve(rhett);
        });
      });
    });

  })
});
