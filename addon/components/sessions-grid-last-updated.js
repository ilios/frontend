import Component from '@ember/component';
import layout from '../templates/components/sessions-grid-last-updated';
import moment from 'moment';

export default Component.extend({
  classNames: ['sessions-grid-last-updated'],
  layout,
  session: null,
  updatedAt: null,
  didReceiveAttrs(){
    this._super(...arguments);
    this.set('updatedAt', moment(this.get('session.updatedAt')).format("L LT"));
  }
});
