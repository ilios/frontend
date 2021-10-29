import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

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
    return this.children.length;
  }

  get isNotDomain() {
    return !this.isDomain;
  }

  get isDomain() {
    return !this.resolvedParent;
  }

  @use resolvedParent = new ResolveAsyncValue(() => [this.parent]);

  get domain() {
    return this.resolvedParent ?? this;
  }

  @use treeChildren = new DeprecatedAsyncCP(() => [
    this._treeChildren.bind(this),
    'competency.treeChildren',
    this.children,
  ]);

  async _treeChildren() {
    const children = await this.children;
    return children.toArray();
  }
}
