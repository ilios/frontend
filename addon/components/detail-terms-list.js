/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import RSVP from 'rsvp';
import layout from '../templates/components/detail-terms-list';

const { all, Promise } = RSVP;

/**
 * Displays all given terms that belong to a given vocabulary as a list of tags.
 */
export default Component.extend({
  layout,
  classNames: ['detail-terms-list'],

  /**
   * Flag indicating whether terms can be removed from the list or not.
   *
   * @property canEdit
   * @type {boolean}
   * @public
   */
  canEdit: false,

  /**
   * A vocabulary model.
   *
   * @property vocabulary
   * @type {DS.Model}
   */
  vocabulary: null,

  /**
   * A list of term models.
   *
   * @property terms
   * @type {Array}
   * @public
   */
  terms: null,

  /**
   * A sorted list of the filtered terms.
   * Terms are sorted by title including parent titles.
   *
   * @property sortedTerms
   * @type {Ember.computed}
   * @public
   */
  sortedTerms: computed('filteredTerms.[]', function() {
    return new Promise(resolve => {
      let terms = this.get('filteredTerms');
      let promises = [];
      let proxies = [];
      terms.forEach(term => {
        promises.pushObject(term.get('titleWithParentTitles').then(title => {
          proxies.pushObject({ term, title });
        }));
      });

      all(promises).then(() => {
        let sortedProxies = proxies.sort((a, b) => {
          let titleA = a.title.toLowerCase();
          let titleB = b.title.toLowerCase();
          return (titleA > titleB ? 1 : (titleA < titleB ? -1 : 0));
        });
        resolve(sortedProxies.mapBy('term'));
      });
    });
  }),

  /**
   * A filtered list of the given terms.
   * Terms are filtered by the given vocabulary.
   *
   * @property filteredTerms
   * @type {Ember.computed}
   * @protected
   */
  filteredTerms: computed('terms.[]', 'vocabulary', function () {
    let terms = this.get('terms');
    if (isEmpty(terms)) {
      return [];
    }
    let vocab = this.get('vocabulary');
    let filteredTerms = [];
    terms.forEach((term) => {
      if (term.get('vocabulary.id') === vocab.get('id')) {
        filteredTerms.push(term);
      }
    });
    return filteredTerms;
  }),

  actions: {
    remove(term) {
      if (this.get('canEdit')) {
        this.sendAction('remove', term);
      }
    }
  }
});
