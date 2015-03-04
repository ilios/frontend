import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'sessions.sessionTitlePlaceholder',
  session: null,
  sessionTypes: [],
  sort: ['title'],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sort'),
  selectedSessionTypeId: null,
  watchSessionType: function(){
    this.set('selectedSessionTypeId', this.get('session.sessionType.id'));
  }.observes('session.sessionType.id'),
  actions: {
    save: function(){
      var sessionType = this.get('sessionTypes').findBy('id', this.get('selectedSessionTypeId'));
      this.set('session.sessionType', sessionType);
      this.sendAction('save', this.get('session'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('session'));
    }
  }
});
