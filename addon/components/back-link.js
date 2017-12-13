import Ember from 'ember';
import layout from '../templates/components/back-link';

const { computed } = Ember;

export default Ember.Component.extend({
  layout,
  i18n: Ember.inject.service(),
  tagName: 'a',
  classNames: ['back-link'],
  attributeBindings: ['title'],
  title: computed('i18n.service', function(){
    const i18n = this.get('i18n');
    return i18n.t('general.returnToPreviousPage');
  }),
  click(){
    window.history.back();
  }
});
