import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { computed } from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Model.extend({
  title: attr('string'),
  calendarColor: attr('string'),
  active: attr('boolean'),
  assessment: attr('boolean'),
  assessmentOption: belongsTo('assessment-option', { async: true }),
  school: belongsTo('school', { async: true }),
  aamcMethods: hasMany('aamc-method', { async: true }),
  sessions: hasMany('session', { async: true }),
  safeCalendarColor: computed('calendarColor', function () {
    const calendarColor = this.calendarColor;
    const pattern = new RegExp('^#[a-fA-F0-9]{6}$');
    if (pattern.test(calendarColor)) {
      return htmlSafe(calendarColor);
    }

    return '';
  }),
  sessionCount: computed('sessions.[]', function () {
    const sessons = this.hasMany('sessions');

    return sessons.ids().length;
  }),
  firstAamcMethod: computed('aamcMethods.[]', async function () {
    const aamcMethods = await this.aamcMethods;
    return aamcMethods.get('firstObject');
  }),
});
