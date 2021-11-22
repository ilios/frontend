import Model, { belongsTo, hasMany, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import Inflector from 'ember-inflector';
import { all, filter } from 'rsvp';

Inflector.inflector.irregular('vocabulary', 'vocabularies');

export default Model.extend({
  title: attr('string'),
  school: belongsTo('school', { async: true }),
  active: attr('boolean'),
  terms: hasMany('term', { async: true }),

  topLevelTerms: computed('terms.[]', async function () {
    const terms = await this.terms;
    return filter(terms.toArray(), async (term) => {
      return !(await term.parent);
    });
  }),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', async function () {
    const terms = await this.terms;
    const vocabularies = await all(terms.toArray().mapBy('vocabulary'));
    return vocabularies.uniq().sortBy('title');
  }),

  /**
   * A list containing all associated terms and their parent terms.
   * @property termsWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termsWithAllParents: computed('terms.[]', async function () {
    const terms = await this.terms;
    const allTerms = await all(terms.toArray().mapBy('termWithAllParents'));
    return allTerms
      .reduce((array, set) => {
        array.pushObjects(set);
        return array;
      }, [])
      .uniq();
  }),

  /**
   * The number of terms attached to this model
   * @property termCount
   * @type {Ember.computed}
   * @public
   */
  termCount: computed('terms.[]', function () {
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),
});
