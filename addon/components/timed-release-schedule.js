import Component from '@ember/component';
import layout from '../templates/components/timed-release-schedule';

export default Component.extend({
  layout,
  tagName: 'span',
  classNames: ['timed-release-schedule'],
  startDate: null,
  endDate: null,
});
