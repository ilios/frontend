import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: 'section',
  classNames: ['new-session', 'new-result', 'form-container'],
  placeholder: t('sessions.sessionTitlePlaceholder'),
  session: null,
  sessionTypes: [],
  sortedSessionTypes: [],
  selectedSessionTypeId: null,
  watchSessionTypes: function(){
    var self = this;
    var session = this.get('session');
    var sessionTypes = this.get('sessionTypes');
    if(sessionTypes.length){
      this.set('sortedSessionTypes', sessionTypes.sortBy('title'));
      if(!session){
        this.set('selectedSessionTypeId', null);
      } else {
        session.get('sessionType').then(function(sessionType){
          if(sessionType){
            self.set('selectedSessionTypeId', sessionType.get('id'));
          } else {
            self.set('selectedSessionTypeId', self.get('defaultSessionType.id'));
          }
        });
      }
    }
  }.observes('sessionTypes.@each').on('init'),
  defaultSessionType: function(){
    var sessionTypes = this.get('sessionTypes');
    //we attempt to load a type with the title of lecture as its the default
    var lectureType = sessionTypes.findBy('title', 'Lecture');
    var defaultType = lectureType?lectureType:sessionTypes.get('firstObject');

    return defaultType;
  }.property('sessionTypes.@each'),
  actions: {
    save: function(){
      var sessionType = this.get('sortedSessionTypes').findBy('id', this.get('selectedSessionTypeId'));
      this.set('session.sessionType', sessionType);
      this.sendAction('save', this.get('session'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('session'));
    }
  }
});
