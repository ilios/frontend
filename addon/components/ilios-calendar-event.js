import Ember from 'ember';
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import { isArray } from '@ember/array';
import { htmlSafe } from '@ember/string';
import { default as CalendarEvent } from 'el-calendar/components/calendar-event';
import layout from '../templates/components/ilios-calendar-event';
import moment from 'moment';
import TooltipContent from '../mixins/tooltip-content';
import colorChange from '../utils/color-change';

const { Handlebars } = Ember;
const { notEmpty, or } = computed;
const { Utils } = Handlebars;
const { escapeExpression } = Utils;

export default CalendarEvent.extend(TooltipContent, {
  i18n: service(),
  layout,
  event: null,
  timeFormat: 'h:mma',
  isDay: false,
  classNameBindings: [
    ':event',
    ':event-pos',
    ':ilios-calendar-event',
    'isDay:day',
    'clickable:clickable',
    'isIlm'
  ],

  isIlm: notEmpty('event.ilmSession'),
  isOffering: notEmpty('event.offering'),
  clickable: or('isIlm', 'isOffering'),

  formattedInstructors: computed('event.instructors.[]', function() {
    const i18n = this.get('i18n');
    let instructors = this.get('event.instructors');
    if (! isArray(instructors) || ! instructors.length) {
      return '';
    }
    if (3 > instructors.length) {
      return instructors.join(', ');
    } else {
      return instructors.slice(0, 2).join(', ') + ' ' + i18n.t('general.etAl');
    }
  }),

  style: computed('event', function() {
    const event = this.get('event');
    if (event == null) {
      return new htmlSafe('');
    }
    const darkcolor = colorChange(event.color, -0.15);

    return new htmlSafe(
      `background-color: ${escapeExpression(event.color)};
       border-left: 4px solid ${escapeExpression(darkcolor)};
       top: ${escapeExpression(this.calculateTop())}%;
       height: ${escapeExpression(this.calculateHeight())}%;
       left: ${escapeExpression(this.calculateLeft())}%;
       width: ${escapeExpression(this.calculateWidth())}%;`
    );
  }),

  daysToShowAlert: null,

  recentlyUpdated: computed('event.lastModified', function(){
    const lastModifiedDate = moment(this.get('event.lastModified'));
    const today = moment();
    const daysSinceLastUpdate = today.diff(lastModifiedDate, 'days');

    return daysSinceLastUpdate < 6 ? true : false;
  }),

  click(){
    if(this.get('clickable')){
      this.get('selectEvent')();
    }
  }
});
