import Model, { hasMany, belongsTo, attr } from '@ember-data/model';

export default class CompetencyModel extends Model {
  @attr('boolean')
  active;

  @attr('string')
  title;

  @belongsTo('school', { async: true, inverse: 'competencies' })
  school;
  @belongsTo('competency', { async: true, inverse: 'children' })
  parent;

  @hasMany('competency', { async: true, inverse: 'parent' })
  children;

  @hasMany('aamc-pcrs', { async: true, inverse: 'competencies' })
  aamcPcrses;

  @hasMany('program-year', { async: true, inverse: 'competencies' })
  programYears;

  @hasMany('program-year-objectives', { async: true, inverse: 'competency' })
  programYearObjectives;

  get childCount() {
    return this.hasMany('children').ids().length;
  }

  async getDomain() {
    const parent = await this.parent;
    if (!parent) {
      return this;
    }
    return parent;
  }
}
