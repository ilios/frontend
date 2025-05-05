import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/weekly-events';
import { setLocale, setupIntl } from 'ember-intl/test-support';
import WeeklyEvents from 'ilios-common/components/weekly-events';
import { array } from '@ember/helper';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | weekly events', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.intl = this.owner.lookup('service:intl');
    this.set('year', 2017);
    await render(
      <template>
        <WeeklyEvents
          @year={{this.year}}
          @expandedWeeks={{(array)}}
          @setYear={{(noop)}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.topNavigation.previousYear.title, 'Go to previous year');
    assert.strictEqual(component.topNavigation.nextYear.title, 'Go to next year');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.previousYear.title, 'Go to previous year');
    assert.strictEqual(component.bottomNavigation.nextYear.title, 'Go to next year');
    assert.strictEqual(component.weeks.length, 52);

    assert.strictEqual(component.weeks[0].title, 'January 1-7');

    await setLocale('es');
    assert.strictEqual(component.weeks[0].title, 'enero 2-8');

    await setLocale('fr');
    assert.strictEqual(component.weeks[0].title, 'janvier 2-8');
  });

  test('top navigation - go to next year', async function (assert) {
    assert.expect(5);
    this.set('year', 2017);
    this.set('setYear', (newYear) => {
      assert.strictEqual(newYear, 2018, 'we moved forward');
      this.set('year', newYear);
    });
    await render(
      <template>
        <WeeklyEvents
          @year={{this.year}}
          @expandedWeeks={{(array)}}
          @setYear={{this.setYear}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    await component.topNavigation.nextYear.visit();
    assert.strictEqual(component.topNavigation.title, '2018');
    assert.strictEqual(component.bottomNavigation.title, '2018');
  });

  test('bottom navigation - go to next year', async function (assert) {
    assert.expect(5);
    this.set('year', 2017);
    this.set('setYear', (newYear) => {
      assert.strictEqual(newYear, 2018, 'we moved forward');
      this.set('year', newYear);
    });
    await render(
      <template>
        <WeeklyEvents
          @year={{this.year}}
          @expandedWeeks={{(array)}}
          @setYear={{this.setYear}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    await component.bottomNavigation.nextYear.visit();
    assert.strictEqual(component.topNavigation.title, '2018');
    assert.strictEqual(component.bottomNavigation.title, '2018');
  });

  test('top navigation - go to previous year', async function (assert) {
    assert.expect(5);
    this.set('year', 2017);
    this.set('setYear', (newYear) => {
      assert.strictEqual(newYear, 2016, 'we moved backwards');
      this.set('year', newYear);
    });
    await render(
      <template>
        <WeeklyEvents
          @year={{this.year}}
          @expandedWeeks={{(array)}}
          @setYear={{this.setYear}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    await component.topNavigation.previousYear.visit();
    assert.strictEqual(component.topNavigation.title, '2016');
    assert.strictEqual(component.bottomNavigation.title, '2016');
  });

  test('bottom navigation - go to previous year', async function (assert) {
    assert.expect(5);
    this.set('year', 2017);
    this.set('setYear', (newYear) => {
      assert.strictEqual(newYear, 2016, 'we moved backwards');
      this.set('year', newYear);
    });
    await render(
      <template>
        <WeeklyEvents
          @year={{this.year}}
          @expandedWeeks={{(array)}}
          @setYear={{this.setYear}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    await component.bottomNavigation.previousYear.visit();
    assert.strictEqual(component.topNavigation.title, '2016');
    assert.strictEqual(component.bottomNavigation.title, '2016');
  });

  test('it renders 2024 ilios/ilios#5908', async function (assert) {
    await render(
      <template>
        <WeeklyEvents
          @year={{2024}}
          @expandedWeeks={{(array)}}
          @setYear={{(noop)}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2024');
    assert.strictEqual(component.weeks.length, 52);
    assert.strictEqual(component.weeks[0].title, 'December 31 - January 6');
    assert.strictEqual(component.weeks[51].title, 'December 22-28');
  });

  test('it renders 2025 ilios/ilios#5908', async function (assert) {
    await render(
      <template>
        <WeeklyEvents
          @year={{2025}}
          @expandedWeeks={{(array)}}
          @setYear={{(noop)}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2025');
    assert.strictEqual(component.weeks.length, 52);
    assert.strictEqual(component.weeks[0].title, 'December 29 - January 4');
    assert.strictEqual(component.weeks[51].title, 'December 21-27');
  });

  test('it renders 2026 ilios/ilios#5908', async function (assert) {
    assert.expect(4);
    await render(
      <template>
        <WeeklyEvents
          @year={{2026}}
          @expandedWeeks={{(array)}}
          @setYear={{(noop)}}
          @toggleOpenWeek={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.topNavigation.title, '2026');
    assert.strictEqual(component.weeks.length, 53);
    assert.strictEqual(component.weeks[0].title, 'December 28 - January 3');
    assert.strictEqual(component.weeks[52].title, 'December 27 - January 2');
  });
});
