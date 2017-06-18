import Ember from 'ember';
import DS from 'ember-data';

const { computed, RSVP } = Ember;
const { Promise, all } = RSVP;

export default Ember.Mixin.create({

  /**
   * Associated taxonomy terms.
   * @property terms
   * @type {Ember.computed}
   * @public
   */
  terms: DS.hasMany('term', {async: true}),

  /**
   * A list of all vocabularies that are associated via terms.
   * @property associatedVocabularies
   * @type {Ember.computed}
   * @public
   */
  associatedVocabularies: computed('terms.@each.vocabulary', function () {
    return new Promise(resolve => {
      this.get('terms').then(terms => {
        all(terms.mapBy('vocabulary')).then(vocabs => {
          let v = [].concat.apply([], vocabs);
          v = v ? v.uniq().sortBy('title') : [];
          resolve(v);
        });
      });
    });
  }),

  /**
   * A list containing all associated terms, plus all parents/superior parents to those nodes.
   * @property termsWithAllParents
   * @type {Ember.computed}
   * @public
   */
  termsWithAllParents: computed('terms.[]', function () {
    return new Promise(resolve => {
      this.get('terms').then(terms => {
        all(terms.mapBy('termWithAllParents')).then(parentTerms => {
          let t = [].concat.apply([], parentTerms);
          t = t ? t.uniq() : [];
          resolve(t);
        });
      });
    });
  }),
  termCount: computed('terms.[]', function(){
    const termIds = this.hasMany('terms').ids();
    return termIds.length;
  }),
});
