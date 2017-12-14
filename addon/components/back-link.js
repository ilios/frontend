import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import layout from '../templates/components/back-link';

export default Component.extend({
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
