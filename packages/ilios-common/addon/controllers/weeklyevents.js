import Controller from '@ember/controller';
import { action } from '@ember/object';
import { getOwner } from '@ember/owner';
import { tracked } from '@glimmer/tracking';
import { DateTime } from 'luxon';

export default class WeeklyeventsController extends Controller {
  queryParams = ['year', 'expanded', 'week'];
  year = DateTime.now().year;
  @tracked expanded = '';
  @tracked week = '';

  get expandedString() {
    return this.expanded ? this.expanded : '';
  }

  get expandedWeeks() {
    return this.expandedString.split('-');
  }

  @action
  toggleOpenWeek(week, shouldOpen) {
    const arr = this.expandedWeeks.filter((w) => w !== week);
    this.week = '';
    if (shouldOpen) {
      arr.push(week);
      this.week = week;
    }
    arr.sort();
    this.expanded = arr.filter(Boolean).join('-');
  }

  get showBackLink() {
    const config = getOwner(this).resolveRegistration('config:environment');
    return config.modulePrefix !== 'ilios' && config.modulePrefix !== 'frontend';
  }
}
