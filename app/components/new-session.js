import Ember from 'ember';
import { translationMacro as t } from "ember-i18n";

export default Ember.Component.extend({
  i18n: Ember.inject.service(),
  tagName: 'section',
  classNames: ['new-session', 'new-result', 'form-container'],
  placeholder: t('sessions.sessionTitlePlaceholder'),
  session: null,
  sessionTypes: [],
  sortSessionsBy: ['title'],
  sortedSessionTypes: Ember.computed.sort('sessionTypes', 'sortSessionsBy'),
  actions: {
    save: function(){
      this.sendAction('save', this.get('session'));
    },
    cancel: function(){
      this.sendAction('cancel', this.get('session'));
    },
    changeSessionType(){
      let selectedEl = this.$('select')[0];
      let selectedIndex = selectedEl.selectedIndex;
      let sortedSessionTypes = this.get('sortedSessionTypes');
      let sessionType = sortedSessionTypes.toArray()[selectedIndex];
      this.set('session.sessionType', sessionType);
    }
  }
});
