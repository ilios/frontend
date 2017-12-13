import Component from '@ember/component';
import layout from '../templates/components/ilios-calendar-multiday-events';

export default Component.extend({
  layout,
  events: null,
  multidayEvents: null,
  areEventsSelectable: true,
});
