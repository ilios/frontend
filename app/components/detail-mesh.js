/* eslint ember/order-in-components: 0 */
import { oneWay, sort } from '@ember/object/computed';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-i18n";

export default Component.extend({
  store: service(),
  i18n: service(),
  init() {
    this._super(...arguments);
    this.set('sortTerms', ['title']);
    this.set('bufferTerms', []);
  },
  classNames: ['detail-mesh'],
  tagName: 'section',
  placeholder: t('general.meshSearchPlaceholder'),
  subject: null,
  terms: oneWay('subject.meshDescriptors'),
  isCourse: false,
  sortTerms: null,
  sortedTerms: sort('terms', 'sortTerms'),
  isSession: false,
  isManaging: false,
  editable: true,
  bufferTerms: null,
  'data-test-detail-mesh': true,
  actions: {
    manage() {
      var self = this;
      this.terms.then(function(terms){
        self.set('bufferTerms', terms.toArray());
        self.set('isManaging', true);
      });
    },
    save() {
      let subject = this.subject;
      let terms = subject.get('meshDescriptors');
      let promises = [];
      terms.clear();
      terms.addObjects(this.bufferTerms);
      this.bufferTerms.forEach((term)=>{
        if(this.isCourse){
          term.get('courses').addObject(subject);
        }
        if(this.isSession){
          term.get('sessions').addObject(subject);
        }
      });
      promises.pushObject(subject.save());
      all(promises).then(()=> {
        this.set('isManaging', false);
      });
    },
    cancel() {
      this.set('bufferTerms', []);
      this.set('isManaging', false);
    },
    addTermToBuffer(term) {
      this.bufferTerms.addObject(term);
    },
    removeTermFromBuffer(term) {
      this.bufferTerms.removeObject(term);
    }
  }
});
