import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import DS from 'ember-data';
import { map } from 'rsvp';
const { collect, sum, gte } = computed;
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
  active: attr('boolean'),

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
  allParents: computed('parent', 'parent.allParents.[]', async function(){
    const parentTerm = await this.get('parent');
    if(!parentTerm) {
      return [];
    }

    const terms = [];
    const allParents = await parentTerm.get('allParents');
    terms.pushObjects(allParents);
    terms.pushObject(parentTerm);
    return terms;
  }),

  /**
   * A list of parent terms of this term, including this term as its last item.
   *
   * @property termWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termWithAllParents: computed('allParents.[]', async function(){
    const terms = [];
    const allParents = await this.get('allParents');
    terms.pushObjects(allParents);
    terms.pushObject(this);
    return terms;
  }),

  /**
   * A list of parent terms titles of this term, sorted by ancestry (oldest ancestor first).
   *
   * @property allParentTitles
   * @type {Ember.computed}
   * @public
   */
  allParentTitles: computed('parent.{title,allParentTitles.[]}', async function() {
    const parentTerm = await this.get('parent');
    if(!parentTerm){
      return [];
    }

    const parents = await parentTerm.get('allParents');
    const titles = parents.mapBy('title');
    titles.push(parentTerm.get('title'));
    return titles;
  }),

  /**
   * A list of parent terms titles of this term, including this term's title as its last item.
   *
   * @property titleWithParentTitles
   * @type {Ember.computed}
   * @public
   */
  titleWithParentTitles: computed('title', 'allParentTitles.[]', async function() {
    const parentTitles = await this.get('allParentTitles');
    if(isEmpty(parentTitles)) {
      return this.get('title');
    }
    return parentTitles.join(' > ') + ' > ' + this.get('title');
  }),

  /**
   * A list of descendants terms of this term.
   *
   * @property termWithAllDescendants
   * @type {Ember.computed}
   * @public
   */
  allDescendants: computed('children.[]', 'children.@each.allDescendants', async function(){
    const descendants = [];
    const children = await this.get('children');
    descendants.pushObjects(children.toArray());
    const childrenDescendants = await map(children.mapBy('allDescendants'), childDescendants => {
      return childDescendants;
    });
    descendants.pushObjects(childrenDescendants.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, []));
    return descendants;
  }),

  /**
   * A list of descendant terms titles of this term, including this term's title as its last item.
   *
   * @property titleWithDescendantTitles
   * @type {Ember.computed}
   * @public
   */
  titleWithDescendantTitles: computed('title', 'allDescendants.[]', async function() {
    const allDescendants = await this.get('allDescendants');
    const allDescendantTitles = allDescendants.mapBy('title');
    if(isEmpty(allDescendantTitles)) {
      return this.get('title');
    }
    return allDescendantTitles.join(' > ') + ' > ' + this.get('title');
  }),

  /**
   * TRUE if this term and all of its ancestors, if existent, are active. FALSE otherwise.
   *
   * @property isActiveInTree
   * @type {Ember.computed}
   * @public
   */
  isActiveInTree: computed('active', 'parent.isActiveInTree', async function() {
    const parent = await this.get('parent');
    const active = this.get('active');

    if (! active) {
      return false;
    }

    if (! parent) {
      return true;
    }

    return parent.get('isActiveInTree');
  })
});
