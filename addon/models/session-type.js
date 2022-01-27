import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { htmlSafe } from '@ember/template';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SessionType extends Model {
  @attr('string')
  title;

  @attr('string')
  calendarColor;

  @attr('boolean')
  active;

  @attr('boolean')
  assessment;

  @belongsTo('assessment-option', { async: true })
  assessmentOption;

  @belongsTo('school', { async: true })
  school;

  @hasMany('aamc-method', { async: true })
  aamcMethods;

  @hasMany('session', { async: true })
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

  @use _aamcMethods = new ResolveAsyncValue(() => [this.aamcMethods]);
  get firstAamcMethod() {
    if (!this._aamcMethods) {
      return undefined;
    }
    return this._aamcMethods.get('firstObject');
  }
}
