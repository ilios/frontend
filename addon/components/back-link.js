import Ember from 'ember';
import layout from '../templates/components/back-link';

const { computed, inject } = Ember;
const { service } = inject;

export default Ember.Component.extend({
  layout,
  i18n: service(),
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
