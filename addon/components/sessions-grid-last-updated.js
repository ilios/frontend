import Component from '@ember/component';
import moment from 'moment';

export default Component.extend({
  classNames: ['sessions-grid-last-updated'],
  session: null,
  updatedAt: null,
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('updatedAt', moment(this.get('session.updatedAt')).format("L LT"));
  }
});
