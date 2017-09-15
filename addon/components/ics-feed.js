import Component from '@ember/component';
import layout from '../templates/components/ics-feed';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  layout: layout,
  classNames: ['ilios-calendar-ics-feed'],
  url: null,
  instructions: null,
  showCopySuccessMessage: false,
  textCopied: task(function * (){
    this.set('showCopySuccessMessage', true);
    yield timeout(3000);
    this.set('showCopySuccessMessage', false);
  }).restartable(),
  actions: {
    refresh(){
      this.sendAction('refresh');
    }
  }
});
