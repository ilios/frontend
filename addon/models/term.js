import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import { deprecate } from '@ember/debug';

export default class Term extends Model {
  @attr('string')
  title;

  @attr('string')
  description;

  @belongsTo('vocabulary', { async: true })
  vocabulary;

  @belongsTo('term', { inverse: 'children', async: true })
  parent;

  @hasMany('term', { inverse: 'parent', async: true })
  children;

  @hasMany('programYear', { async: true })
  programYears;

  @hasMany('session', { async: true })
  sessions;

  @hasMany('course', { async: true })
  courses;

  @hasMany('aamcResourceType', { async: true })
  aamcResourceTypes;

  @attr('boolean')
  active;

  @hasMany('course-objective', { async: true })
  courseObjectives;

  @hasMany('program-year-objective', { async: true })
  programYearObjectives;

  @hasMany('session-objective', { async: true })
  sessionObjectives;

  @use allParentTitles = new DeprecatedAsyncCP(() => [
    this.getAllParentTitles.bind(this),
    'term.allParentTitles',
  ]);

  @use titleWithParentTitles = new DeprecatedAsyncCP(() => [
    this.getTitleWithParentTitles.bind(this),
    'term.titleWithParentTitles',
  ]);

  @use allDescendants = new DeprecatedAsyncCP(() => [
    this.getAllDescendants.bind(this),
    'term.allDescendants',
  ]);

  @use titleWithDescendantTitles = new DeprecatedAsyncCP(() => [
    this.getTitleWithDescendantTitles.bind(this),
    'term.titleWithDescendantTitles',
  ]);

  @use isActiveInTree = new DeprecatedAsyncCP(() => [
    this.getIsActiveInTree.bind(this),
    'term.isActiveInTree',
  ]);

  get associatedLengths() {
    return [
      this.programYears.length,
      this.courses.length,
      this.sessions.length,
      this.programYearObjectives.length,
      this.courseObjectives.length,
      this.sessionObjectives.length,
    ];
  }

  get totalAssociations() {
    return this.associatedLengths.reduce((prev, curr) => prev + curr);
  }

  get hasAssociations() {
    return !!this.totalAssociations;
  }

  get isTopLevel() {
    deprecate(`term.isTopLevel called, check parent attribute directly instead.`, false, {
      id: 'common.term-is-top-level',
      for: 'ilios-common',
      until: '62',
      since: '62.0.1',
    });
    return !this.belongsTo('parent').id();
  }

  get childCount() {
    return this.children.length;
  }

  get hasChildren() {
    return !!this.childCount;
  }

  /**
   * A list of parent terms of this term, sorted by ancestry (oldest ancestor first).
   */
  async getAllParents() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const allParents = await parent.getAllParents();
    return [...allParents, parent];
  }

  /**
   * A list of parent terms titles of this term, sorted by ancestry (oldest ancestor first).
   */
  async getAllParentTitles() {
    const parent = await this.parent;
    if (!parent) {
      return [];
    }
    const parents = await parent.getAllParents();
    const titles = parents.mapBy('title');
    return [...titles, parent.title];
  }

  /**
   * A list of parent terms titles of this term, including this term's title as its last item.
   */
  async getTitleWithParentTitles() {
    const parentTitles = await this.getAllParentTitles();
    if (!parentTitles.length) {
      return this.title;
    }
    return parentTitles.join(' > ') + ' > ' + this.title;
  }

  async getAllDescendants() {
    const descendants = [];
    const children = await this.children;
    descendants.pushObjects(children.toArray());
    const childrenDescendants = await Promise.all(
      children.toArray().map(async (child) => {
        return child.getAllDescendants();
      })
    );
    descendants.pushObjects(
      childrenDescendants.reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, [])
    );
    return descendants;
  }

  /**
   * A list of descendant terms titles of this term, including this term's title as its last item.
   */
  async getTitleWithDescendantTitles() {
    const allDescendants = await this.getAllDescendants();
    const allDescendantTitles = allDescendants.mapBy('title');
    if (!allDescendantTitles.length) {
      return this.title;
    }
    return allDescendantTitles.join(' > ') + ' > ' + this.title;
  }

  /**
   * TRUE if this term and all of its ancestors, if existent, are active. FALSE otherwise.
   */
  async getIsActiveInTree() {
    const parent = await this.parent;
    const active = this.active;

    if (!active) {
      return false;
    }

    if (!parent) {
      return true;
    }

    return parent.getIsActiveInTree();
  }
}
