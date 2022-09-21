import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import Inflector from 'ember-inflector';
import { filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';

Inflector.inflector.irregular('vocabulary', 'vocabularies');

export default class Vocabulary extends Model {
  @attr('string')
  title;

  @belongsTo('school', { async: true })
  school;

  @attr('boolean')
  active;

  @hasMany('term', { async: true })
  terms;

  @use topLevelTerms = new DeprecatedAsyncCP(() => [
    this.getTopLevelTerms.bind(this),
    'vocabulary.topLevelTerms',
  ]);

  async getTopLevelTerms() {
    const terms = await this.terms;
    return filter(terms.slice(), async (term) => {
      return !(await term.parent);
    });
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }
}
