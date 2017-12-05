/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  store: service(),
  i18n: service(),
  flashMessages: service(),
  subject: null,
  bufferedTerms: null,
  tagName: 'section',
  classNameBindings: [':detail-taxonomies', ':taxonomy-manager', 'showCollapsible:collapsible'],
  isManaging: false,
  isSaving: false,
  editable: true,

  init(){
    this._super(...arguments);
    this.set('bufferedTerms', []);
  },

  showCollapsible: computed('isManaging', 'subject.terms.[]', function () {
    const isManaging = this.get('isManaging');
    const terms = this.get('subject.terms');
    return !isManaging && terms.get('length');
  }),

  actions: {
    manage() {
      const expand = this.get('expand');
      expand();
      this.get('subject.terms').then(terms => {
        this.set('bufferedTerms', terms.toArray());
        this.set('isManaging', true);
      });
    },
    collapse(){
      const collapse = this.get('collapse');
      this.get('subject.terms').then(terms => {
        if (terms.get('length')) {
          collapse();
        }
      });
    },
    save(){
      this.set('isSaving', true);
      let subject = this.get('subject');
      subject.get('terms').then(termsList => {
        termsList.clear();
        this.get('bufferedTerms').forEach(term=>{
          termsList.pushObject(term);
        });
        subject.save().then(()=>{
          this.set('bufferedTerms', []);
          this.set('isSaving', false);
          this.set('isManaging', false);
        });
      });
    },
    cancel() {
      this.set('bufferedTerms', []);
      this.set('isManaging', false);
    },
    addTermToBuffer(term) {
      this.get('bufferedTerms').addObject(term);
    },
    removeTermFromBuffer(term) {
      this.get('bufferedTerms').removeObject(term);
    }
  }
});
