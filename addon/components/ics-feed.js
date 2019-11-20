import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['ilios-calendar-ics-feed'],
  url: null,
  instructions: null,
  showCopySuccessMessage: false,
  actions: {
    refresh(){
      this.refresh();
    }
  },
  textCopied: task(function * (){
    this.set('showCopySuccessMessage', true);
    yield timeout(3000);
    this.set('showCopySuccessMessage', false);
  }).restartable(),
});
