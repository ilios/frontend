import Component from '@glimmer/component';
import { action } from '@ember/object';
import { DateTime } from 'luxon';

export default class WeeklyEvents extends Component {
  get weeksInYear() {
    const { weeksInWeekYear } = DateTime.fromObject({ year: this.args.year });
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
}

<div class="weekly-events" data-test-weekly-events>
  <div class="year" data-test-top-nav>
    <h2>
      <button
        class="link-button"
        type="button"
        {{on "click" this.decrementYear}}
        data-test-previous
      >
        <FaIcon @icon="backward" @title={{t "general.goToPreviousYear"}} />
      </button>
      <span data-test-year>{{@year}}</span>
      <button class="link-button" type="button" {{on "click" this.incrementYear}} data-test-next>
        <FaIcon @icon="forward" @title={{t "general.goToNextYear"}} />
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
        {{on "click" this.decrementYear}}
        data-test-previous
      >
        <FaIcon @icon="backward" @title={{t "general.goToPreviousYear"}} />
      </button>
      <span data-test-year>{{@year}}</span>
      <button class="link-button" type="button" {{on "click" this.incrementYear}} data-test-next>
        <FaIcon @icon="forward" @title={{t "general.goToNextYear"}} />
      </button>
    </h2>
  </div>
</div>