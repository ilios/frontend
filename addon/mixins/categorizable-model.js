import Ember from 'ember';
import DS from 'ember-data';

const { hasMany } = DS;
const { computed, Mixin, RSVP } = Ember;
const { all } = RSVP;

export default Mixin.create({

  /**
   * Associated taxonomy terms.
   * @property terms
   * @type {Ember.computed}
   * @public
   */
  terms: hasMany('term', {async: true}),

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

  /**
   * The number of terms attached to this model
   * @property termCount
   * @type {Ember.computed}
   * @public
   */
  termCount: computed('terms.[]', function(){
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),
});
