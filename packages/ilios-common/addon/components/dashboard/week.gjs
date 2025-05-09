import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import WeekGlance from 'ilios-common/components/week-glance';

export default class DashboardWeekComponent extends Component {
  get expanded() {
    const lastWeek = this.thisThursday.minus({ week: 1 }).toFormat('W');
    const thisWeek = this.thisThursday.toFormat('W');
    const nextWeek = this.thisThursday.plus({ week: 1 }).toFormat('W');

    return `${lastWeek}-${thisWeek}-${nextWeek}`;
  }

  get thisThursday() {
    const thursday = DateTime.fromObject({
      weekday: 4,
      hour: 0,
      minute: 0,
      second: 0,
    });

    // In this component the week always starts on Sunday, but luxon's starts on Monday
    // If today is sunday, we need to add a week to get the correct Thursday
    if (DateTime.now().weekday === 7) {
      return thursday.plus({ weeks: 1 });
    }

    return thursday;
  }

  get year() {
    return this.thisThursday.weekYear;
  }

  get week() {
    return this.thisThursday.weekNumber;
  }
  <template>
    <div class="dashboard-week" data-test-dashboard-week>
      <div class="dashboard-week-content">
        <div class="weeklylink" data-test-weekly-link>
          {{t "general.view"}}:
          <LinkTo @route="weeklyevents" @query={{hash expanded=this.expanded week=this.week}}>
            {{t "general.allWeeks"}}
          </LinkTo>
        </div>
        <WeekGlance
          @collapsed={{false}}
          @collapsible={{false}}
          @showFullTitle={{true}}
          @week={{this.week}}
          @year={{this.year}}
        />
      </div>
    </div>
  </template>
}
