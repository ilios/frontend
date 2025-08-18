import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { DateTime } from 'luxon';
import { action } from '@ember/object';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { LinkTo } from '@ember/routing';
import { fn, hash } from '@ember/helper';
import inViewport from 'ember-in-viewport/modifiers/in-viewport';
import FaIcon from 'ilios-common/components/fa-icon';
import WeekGlance from 'ilios-common/components/week-glance';

export default class DashboardWeekComponent extends Component {
  @tracked displayBackToTop = false;

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

  @action
  toggleBackToTop(visibility) {
    this.displayBackToTop = visibility;
  }

  @action
  backToTop() {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  <template>
    <div class="dashboard-week" data-test-dashboard-week>
      <div class="dashboard-week-content">
        <div
          class="weeklylink"
          {{inViewport
            onExit=(fn this.toggleBackToTop true)
            onEnter=(fn this.toggleBackToTop false)
            viewportSpy=true
          }}
          data-test-weekly-link
        >
          {{t "general.view"}}:
          <LinkTo
            @route="weeklyevents"
            @query={{hash expanded=this.expanded week=this.week year=this.year}}
          >
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
      <button
        type="button"
        class="back-to-top{{if this.displayBackToTop ' visible'}}"
        aria-label={{t "general.backToTop"}}
        {{on "click" this.backToTop}}
      >
        <FaIcon @icon="chevron-up" />
        <span>{{t "general.backToTop"}}</span>
      </button>
    </div>
  </template>
}
