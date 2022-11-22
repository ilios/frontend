import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/weekly-events';

module('Integration | Component | weekly events', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('year', 2017);
    await render(hbs`<WeeklyEvents
      @year={{this.year}}
      @expandedWeeks={{(array)}}
      @setYear={{(noop)}}
      @toggleOpenWeek={{(noop)}}
    />
`);
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.topNavigation.previousYear.title, 'Go to previous year');
    assert.strictEqual(component.topNavigation.nextYear.title, 'Go to next year');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.previousYear.title, 'Go to previous year');
    assert.strictEqual(component.bottomNavigation.nextYear.title, 'Go to next year');
    assert.strictEqual(component.weeks.length, 52);
  });

  test('top navigation - go to next year', async function (assert) {
    assert.expect(5);
    this.set('year', 2017);
    this.set('setYear', (newYear) => {
      assert.strictEqual(newYear, 2018, 'we moved forward');
      this.set('year', newYear);
    });
    await render(hbs`<WeeklyEvents
      @year={{this.year}}
      @expandedWeeks={{(array)}}
      @setYear={{this.setYear}}
      @toggleOpenWeek={{(noop)}}
    />
`);
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
    await render(hbs`<WeeklyEvents
      @year={{this.year}}
      @expandedWeeks={{(array)}}
      @setYear={{this.setYear}}
      @toggleOpenWeek={{(noop)}}
    />
`);
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
    await render(hbs`<WeeklyEvents
      @year={{this.year}}
      @expandedWeeks={{(array)}}
      @setYear={{this.setYear}}
      @toggleOpenWeek={{(noop)}}
    />
`);
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
    await render(hbs`<WeeklyEvents
      @year={{this.year}}
      @expandedWeeks={{(array)}}
      @setYear={{this.setYear}}
      @toggleOpenWeek={{(noop)}}
    />
`);
    assert.strictEqual(component.topNavigation.title, '2017');
    assert.strictEqual(component.bottomNavigation.title, '2017');
    await component.bottomNavigation.previousYear.visit();
    assert.strictEqual(component.topNavigation.title, '2016');
    assert.strictEqual(component.bottomNavigation.title, '2016');
  });
});
