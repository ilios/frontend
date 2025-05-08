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