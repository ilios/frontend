import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { map } from 'rsvp';
const { collect, sum, gte } = computed;

export default Model.extend({
  title: attr('string'),
  description: attr('string'),
  vocabulary: belongsTo('vocabulary', { async: true }),
  parent: belongsTo('term', { inverse: 'children', async: true }),
  children: hasMany('term', { inverse: 'parent', async: true }),
  programYears: hasMany('programYear', { async: true }),
  sessions: hasMany('session', { async: true }),
  courses: hasMany('course', { async: true }),
  aamcResourceTypes: hasMany('aamcResourceType', { async: true }),
  associatedLengths: collect(
    'programYears.length',
    'courses.length',
    'sessions.length',
    'programYearObjectives.length',
    'courseObjectives.length',
    'sessionObjectives.length'
  ),
  totalAssociations: sum('associatedLengths'),
  hasAssociations: gte('totalAssociations', 1),
  active: attr('boolean'),
  courseObjectives: hasMany('course-objective', { async: true }),
  programYearObjectives: hasMany('program-year-objective', { async: true }),
  sessionObjectives: hasMany('session-objective', { async: true }),

  isTopLevel: computed('parent', function () {
    return isEmpty(this.belongsTo('parent').id());
  }),

  hasChildren: computed.gt('childCount', 0),

  childCount: computed('children', function () {
    return this.hasMany('children').ids().length;
  }),

  /**
   * A list of parent terms of this term, sorted by ancestry (oldest ancestor first).
   *
   * @property allParents
   * @type {Ember.computed}
   * @public
   */
  allParents: computed('parent', 'parent.allParents.[]', async function () {
    const parentTerm = await this.parent;
    if (!parentTerm) {
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
  termWithAllParents: computed('allParents.[]', async function () {
    const terms = [];
    const allParents = await this.allParents;
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
  allParentTitles: computed('parent.{title,allParentTitles.[]}', async function () {
    const parentTerm = await this.parent;
    if (!parentTerm) {
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
  titleWithParentTitles: computed('title', 'allParentTitles.[]', async function () {
    const parentTitles = await this.allParentTitles;
    if (isEmpty(parentTitles)) {
      return this.title;
    }
    return parentTitles.join(' > ') + ' > ' + this.title;
  }),

  /**
   * A list of descendants terms of this term.
   *
   * @property termWithAllDescendants
   * @type {Ember.computed}
   * @public
   */
  allDescendants: computed('children.[]', 'children.@each.allDescendants', async function () {
    const descendants = [];
    const children = await this.children;
    descendants.pushObjects(children.toArray());
    const childrenDescendants = await map(children.mapBy('allDescendants'), (childDescendants) => {
      return childDescendants;
    });
    descendants.pushObjects(
      childrenDescendants.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, [])
    );
    return descendants;
  }),

  /**
   * A list of descendant terms titles of this term, including this term's title as its last item.
   *
   * @property titleWithDescendantTitles
   * @type {Ember.computed}
   * @public
   */
  titleWithDescendantTitles: computed('title', 'allDescendants.[]', async function () {
    const allDescendants = await this.allDescendants;
    const allDescendantTitles = allDescendants.mapBy('title');
    if (isEmpty(allDescendantTitles)) {
      return this.title;
    }
    return allDescendantTitles.join(' > ') + ' > ' + this.title;
  }),

  /**
   * TRUE if this term and all of its ancestors, if existent, are active. FALSE otherwise.
   *
   * @property isActiveInTree
   * @type {Ember.computed}
   * @public
   */
  isActiveInTree: computed('active', 'parent.isActiveInTree', async function () {
    const parent = await this.parent;
    const active = this.active;

    if (!active) {
      return false;
    }

    if (!parent) {
      return true;
    }

    return parent.get('isActiveInTree');
  }),
});
