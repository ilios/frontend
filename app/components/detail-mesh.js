import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  classNames: ['detail-mesh'],
  placeholder: t('courses.meshSearchPlaceholder'),
  subject: null,
  terms: Ember.computed.oneWay('subject.meshDescriptors'),
  isCourse: false,
  sortTerms: ['title'],
  sortedTerms: Ember.computed.sort('terms', 'sortTerms'),
  isSession: false,
  isManaging: false,
  bufferTerms: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('terms').then(function(terms){
        self.set('bufferTerms', terms.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
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
      Ember.RSVP.all(promises).then(()=> {
        this.set('isManaging', false);
      });
    },
    cancel: function(){
      this.set('bufferTerms', []);
      this.set('isManaging', false);
    },
    addTermToBuffer: function(term){
      this.get('bufferTerms').addObject(term);
    },
    removeTermFromBuffer: function(term){
      this.get('bufferTerms').removeObject(term);
    }
  }
});
