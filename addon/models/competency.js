import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import { deprecate } from '@ember/debug';

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
    return this.hasMany('children').ids().length;
  }

  get isNotDomain() {
    deprecate(`competency.isNotDomain called, check parent attribute directly instead.`, false, {
      id: 'common.competency-is-not-domain',
      for: 'ilios-common',
      until: '62',
      since: '61.0.0',
    });
    return !this.isDomain;
  }

  get isDomain() {
    deprecate(`competency.isDomain called, check parent attribute directly instead.`, false, {
      id: 'common.competency-is-domain',
      for: 'ilios-common',
      until: '62',
      since: '61.0.0',
    });
    return !this.belongsTo('parent').id();
  }

  @use domain = new DeprecatedAsyncCP(() => [
    this.getDomain.bind(this),
    'competency.domain',
    this.parent,
  ]);

  @use treeChildren = new DeprecatedAsyncCP(() => [
    this._treeChildren.bind(this),
    'competency.treeChildren',
    this.children,
  ]);

  async getDomain() {
    const parent = await this.parent;
    if (!parent) {
      return this;
    }
    return parent;
  }

  async _treeChildren() {
    const children = await this.children;
    return children.slice();
  }
}
