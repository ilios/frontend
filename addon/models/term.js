import DS from 'ember-data';
import Ember from 'ember';

const { computed, isEmpty, RSVP } =  Ember;
const { collect, sum, gte } = computed;
const { Promise } = RSVP;
const { attr, belongsTo, hasMany, Model } = DS;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  vocabulary: belongsTo('vocabulary', {async: true}),
  parent: belongsTo('term', { inverse: 'children', async: true }),
  children: hasMany('term', { inverse: 'parent', async: true }),
  programYears: hasMany('programYear', { async: true }),
  sessions: hasMany('session', { async: true }),
  courses: hasMany('course', { async: true }),
  aamcResourceTypes: hasMany('aamcResourceType', { async: true }),
  associatedLengths: collect('programYears.length', 'courses.length', 'sessions.length'),
  totalAssociations: sum('associatedLengths'),
  hasAssociations: gte('totalAssociations', 1),

  isTopLevel: computed('parent', function() {
    return isEmpty(this.belongsTo('parent').id());
  }),

  hasChildren: computed('children', function() {
    return (this.hasMany('children').ids().length > 0);
  }),

  /**
   * A list of parent terms of this term, sorted by ancestry (oldest ancestor first).
   *
   * @property allParents
   * @type {Ember.computed}
   * @public
   */
  allParents: computed('parent', 'parent.allParents.[]', function(){
    return new Promise(resolve => {
      this.get('parent').then(parentTerm => {
        let parents = [];
        if(!parentTerm){
          resolve(parents);
        } else {
          parents.pushObject(parentTerm);
          parentTerm.get('allParents').then(allParents => {
            parents.pushObjects(allParents);
            resolve(parents);
          });
        }
      });
    });
  }),

  /**
   * A list of parent terms of this term, including this term as its last item.
   *
   * @property termWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termWithAllParents: computed('allParents.[]', function(){
    return new Promise(resolve => {
      let terms = [];
      let term = this;
      this.get('allParents').then(allParents => {
        terms.pushObjects(allParents);
        terms.pushObject(term);
        resolve(terms);
      });
    });
  }),

  /**
   * A list of parent terms titles of this term, sorted by ancestry (oldest ancestor first).
   *
   * @property allParentTitles
   * @type {Ember.computed}
   * @public
   */
  allParentTitles: computed('parent.{title,allParentTitles.[]}', function() {
    return new Promise(resolve => {
      this.get('parent').then(parentTerm => {
        let titles = [];
        if(!parentTerm){
          resolve(titles);
        } else {
          parentTerm.get('allParents').then(parents => {
            titles = titles.concat(parents.mapBy('title'));
            titles.push(this.get('parent.title'));
            resolve(titles);
          });
        }
      });
    });
  }),

  /**
   * A list of parent terms titles of this term, including this term's title as its last item.
   *
   * @property titleWithParentTitles
   * @type {Ember.computed}
   * @public
   */
  titleWithParentTitles: computed('title', 'allParentTitles.[]', function() {
    return new Promise(resolve => {
      this.get('allParentTitles').then(parentTitles => {
        let title;
        if (! parentTitles.get('length')) {
          title = this.get('title');
        } else {
          title = parentTitles.join(' > ') + ' > ' + this.get('title');
        }
        resolve(title);
      });
    });
  }),
});
