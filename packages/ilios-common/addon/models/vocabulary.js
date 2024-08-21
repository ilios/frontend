import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { filter } from 'rsvp';

export default class Vocabulary extends Model {
  @attr('string')
  title;

  @belongsTo('school', { async: true, inverse: 'vocabularies' })
  school;

  @attr('boolean')
  active;

  @hasMany('term', { async: true, inverse: 'vocabulary' })
  terms;

  async getTopLevelTerms() {
    return filter(this.terms, async (term) => {
      return !(await term.parent);
    });
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }
}
