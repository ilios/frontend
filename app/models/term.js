import DS from 'ember-data';
import Ember from 'ember';

const { computed, RSVP } =  Ember;
const { empty, notEmpty, collect, sum, gte } = computed;
const { defer } = RSVP;
const { attr, belongsTo, hasMany, Model, PromiseArray, PromiseObject } = DS;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  vocabulary: belongsTo('vocabulary', {async: true}),
  parent: belongsTo('term', { inverse: 'children', async: true }),
  children: hasMany('term', { inverse: 'parent', async: true }),
  isTopLevel: empty('parent.content'),
  programYears: hasMany('programYear', { async: true }),
  sessions: hasMany('session', { async: true }),
  courses: hasMany('course', { async: true }),
  aamcResourceTypes: hasMany('term', { async: true }),
  hasChildren: notEmpty('children.content'),
  associatedLengths: collect('programYears.length', 'courses.length', 'sessions.length'),
  totalAssociations: sum('associatedLengths'),
  hasAssociations: gte('totalAssociations', 1),

  allParents: computed('parent', 'parent.allParents.[]', function(){
    var deferred = defer();
    this.get('parent').then(parent => {
      var parents = [];
      if(!parent){
        deferred.resolve(parents);
      } else {
        parents.pushObject(parent);
        parent.get('allParents').then(allParents => {
          parents.pushObjects(allParents);
          deferred.resolve(parents);
        });
      }
    });
    return PromiseArray.create({
      promise: deferred.promise
    });
  }),

  termWithAllParents: computed('allParents.[]', function(){
    let deferred = defer();
    let terms = [];
    let term = this;
    this.get('allParents').then(allParents => {
      terms.pushObjects(allParents);
      terms.pushObject(term);
      deferred.resolve(terms);
    });

    return PromiseArray.create({
      promise: deferred.promise
    });
  }),

  allParentTitles: computed('parent.{title,allParentTitles.[]}', function() {
    let deferred = defer();

    this.get('parent').then(parent => {
      let titles = [];
      if(!parent){
        deferred.resolve(titles);
      } else {
        parent.get('allParents').then(parents => {
          titles = titles.concat(parents.mapBy('title'));
          titles.push(this.get('parent.title'));
          deferred.resolve(titles);
        });
      }
    });

    return PromiseArray.create({
      promise: deferred.promise
    });

  }),

  titleWithParentTitles: computed('title', 'allParentTitles.[]', function() {
    let deferred = defer();
    this.get('allParentTitles').then(parentTitles => {
      let title;
      if (! parentTitles.get('length')) {
        title = this.get('title');
      } else {
        title = parentTitles.join(' > ') + ' > ' + this.get('title');
      }
      deferred.resolve(title);
    });

    return PromiseObject.create({
      promise: deferred.promise
    });
  }),

});
