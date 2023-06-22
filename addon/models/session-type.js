import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { htmlSafe } from '@ember/template';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SessionType extends Model {
  @attr('string')
  title;

  @attr('string')
  calendarColor;

  @attr('boolean')
  active;

  @attr('boolean')
  assessment;

  @belongsTo('assessment-option', { async: true, inverse: 'sessionTypes' })
  assessmentOption;

  @belongsTo('school', { async: true, inverse: 'sessionTypes' })
  school;

  @hasMany('aamc-method', { async: true, inverse: 'sessionTypes' })
  aamcMethods;

  @cached
  get _aamcMethodsData() {
    return new TrackedAsyncData(this.aamcMethods);
  }

  @hasMany('session', { async: true, inverse: 'sessionType' })
  sessions;

  get safeCalendarColor() {
    const pattern = new RegExp('^#[a-fA-F0-9]{6}$');
    if (pattern.test(this.calendarColor)) {
      return htmlSafe(this.calendarColor);
    }
    return '';
  }

  get sessionCount() {
    return this.hasMany('sessions').ids().length;
  }

  get firstAamcMethod() {
    if (!this._aamcMethodsData.isResolved) {
      return undefined;
    }
    return this._aamcMethodsData.value[0];
  }
}
