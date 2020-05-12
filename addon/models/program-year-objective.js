import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { all } from 'rsvp';

export default Model.extend({
  objective: belongsTo('objective', { async: true }),
  position: attr('number', { defaultValue: 0 }),
  programYear: belongsTo('program-year', { async: true }),
  terms: hasMany('term', { async: true }),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', async function () {
    const terms = await this.get('terms');
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
    const terms = await this.get('terms');
    const allTerms = await all(terms.toArray().mapBy('termWithAllParents'));
    return (allTerms.reduce((array, set) => {
      array.pushObjects(set);
      return array;
    }, [])).uniq();
  }),
});
