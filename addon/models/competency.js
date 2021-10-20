import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import { isEmpty } from '@ember/utils';

export default class CompetencyModel extends Model {
  @attr('boolean')
  active;

  @attr('string')
  title;

  @belongsTo('school', { async: true })
  school;
  @belongsTo('competency', { async: true, inverse: 'children' })
  parent;

  @hasMany('competency', { async: true, inverse: 'parent' })
  children;

  @hasMany('aamc-pcrs', { async: true })
  aamcPcrses;

  @hasMany('program-year', { async: true })
  programYears;

  @hasMany('program-year-objectives', { async: true })
  programYearObjectives;

  get childCount() {
    const childrenIds = this.hasMany('children').ids();
    return childrenIds.length;
  }

  get isNotDomain() {
    return !this.isDomain;
  }

  get isDomain() {
    return !this.belongsTo('parent').id();
  }

  @use domain = new DeprecatedAsyncCP(() => [
    this._getDomain.bind(this),
    'competency.domain',
    this.parent,
  ]);

  @use treeChildren = new DeprecatedAsyncCP(() => [
    this._treeChildren.bind(this),
    'competency.treeChildren',
    this.children,
  ]);

  async _getDomain() {
    const parent = await this.parent;
    if (!parent) {
      return this;
    }
    return await parent.get('domain');
  }

  async _treeChildren() {
    const rhett = [];
    const children = await this.children;
    rhett.pushObjects(children.toArray());

    const trees = await Promise.all(children.mapBy('treeChildren'));
    const competencies = trees.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);
    rhett.pushObjects(competencies);
    return rhett.uniq().filter((item) => {
      return !isEmpty(item);
    });
  }
}
