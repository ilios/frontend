/* eslint ember/order-in-components: 0 */
import { oneWay, sort } from '@ember/object/computed';
import layout from '../templates/components/detail-mesh';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { translationMacro as t } from "ember-i18n";

export default Component.extend({
  layout,
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
      this.get('terms').then(function(terms){
        self.set('bufferTerms', terms.toArray());
        self.set('isManaging', true);
      });
    },
    save() {
      let subject = this.get('subject');
      let terms = subject.get('meshDescriptors');
      let promises = [];
      terms.clear();
      terms.addObjects(this.get('bufferTerms'));
      this.get('bufferTerms').forEach((term)=>{
        if(this.get('isCourse')){
          term.get('courses').addObject(subject);
        }
        if(this.get('isSession')){
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
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer(term) {
      this.get('bufferTerms').removeObject(term);
    }
  }
});
