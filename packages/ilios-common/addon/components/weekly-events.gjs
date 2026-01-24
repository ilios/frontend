import Component from '@glimmer/component';
import { action } from '@ember/object';
import { DateTime } from 'luxon';
import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import WeekGlance from 'ilios-common/components/week-glance';
import not from 'ember-truth-helpers/helpers/not';
import includes from 'ilios-common/helpers/includes';
import { fn } from '@ember/helper';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';

export default class WeeklyEvents extends Component {
  get weeksInYear() {
    const { weeksInWeekYear } = DateTime.fromObject({ weekYear: this.args.year });
    const weeks = [];
    for (let i = 1; i <= weeksInWeekYear; i++) {
      weeks.push(`${i}`);
    }
    return weeks;
  }

  get weekInFocus() {
    return this.args.weekInFocus || '';
  }

  @action
  incrementYear() {
    this.args.setYear(parseInt(this.args.year, 10) + 1);
  }

  @action
  decrementYear() {
    this.args.setYear(parseInt(this.args.year, 10) - 1);
  }
  <template>
    <div class="weekly-events main-section" data-test-weekly-events>
      <div class="year" data-test-top-nav>
        <h2>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.goToPreviousYear"}}
            {{on "click" this.decrementYear}}
            data-test-previous
          >
            <FaIcon @icon={{faBackward}} @title={{t "general.goToPreviousYear"}} />
          </button>
          <span data-test-year>{{@year}}</span>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.goToNextYear"}}
            {{on "click" this.incrementYear}}
            data-test-next
          >
            <FaIcon @icon={{faForward}} @title={{t "general.goToNextYear"}} />
          </button>
        </h2>
      </div>
      {{#each this.weeksInYear as |week|}}
        <WeekGlance
          @collapsible={{true}}
          @collapsed={{not (includes week @expandedWeeks)}}
          @weekInFocus={{@weekInFocus}}
          @year={{@year}}
          @week={{week}}
          @toggleCollapsed={{fn @toggleOpenWeek week}}
        />
      {{/each}}
      <div class="year" data-test-bottom-nav>
        <h2>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.goToPreviousYear"}}
            {{on "click" this.decrementYear}}
            data-test-previous
          >
            <FaIcon @icon={{faBackward}} @title={{t "general.goToPreviousYear"}} />
          </button>
          <span data-test-year>{{@year}}</span>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.goToNextYear"}}
            {{on "click" this.incrementYear}}
            data-test-next
          >
            <FaIcon @icon={{faForward}} @title={{t "general.goToNextYear"}} />
          </button>
        </h2>
      </div>
    </div>
  </template>
}
