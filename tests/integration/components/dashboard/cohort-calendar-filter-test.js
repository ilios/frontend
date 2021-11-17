import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/dashboard/cohort-calendar-filter';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | dashboard/cohort-calendar-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    this.set('cohortProxies', [
      {
        id: 1,
        programTitle: 'program 1',
        displayTitle: 'name 1',
        classOfYear: 2015,
      },
      {
        id: 2,
        programTitle: 'program 2',
        displayTitle: 'name 2',
        classOfYear: 2014,
      },
      {
        id: 3,
        programTitle: 'program 3',
        displayTitle: 'name 3',
        classOfYear: 2019,
      },
      {
        id: 4,
        programTitle: 'program 4',
        displayTitle: 'name 4',
        classOfYear: 2025,
      },
    ]);
    await render(hbs`<Dashboard::CohortCalendarFilter
      @cohortProxies={{this.cohortProxies}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.cohorts.length, 4);
    assert.strictEqual(component.cohorts[3].title, 'name 2 program 2');
    assert.strictEqual(component.cohorts[2].title, 'name 1 program 1');
    assert.strictEqual(component.cohorts[1].title, 'name 3 program 3');
    assert.strictEqual(component.cohorts[0].title, 'name 4 program 4');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('selected cohorts are checked', async function (assert) {
    this.set('cohortProxies', [
      {
        id: 1,
        programTitle: 'program 1',
        displayTitle: 'name 1',
        classOfYear: 2015,
      },
      {
        id: 2,
        programTitle: 'program 2',
        displayTitle: 'name 2',
        classOfYear: 2014,
      },
      {
        id: 3,
        programTitle: 'program 3',
        displayTitle: 'name 3',
        classOfYear: 2013,
      },
      {
        id: 4,
        programTitle: 'program 4',
        displayTitle: 'name 4',
        classOfYear: 2012,
      },
    ]);
    await render(hbs`<Dashboard::CohortCalendarFilter
      @cohortProxies={{this.cohortProxies}}
      @selectedIds={{array 2 3}}
      @add={{(noop)}}
      @remove={{(noop)}}
    />`);

    assert.strictEqual(component.cohorts.length, 4);
    assert.strictEqual(component.cohorts[0].title, 'name 1 program 1');
    assert.notOk(component.cohorts[0].isChecked);
    assert.strictEqual(component.cohorts[1].title, 'name 2 program 2');
    assert.ok(component.cohorts[1].isChecked);
    assert.strictEqual(component.cohorts[2].title, 'name 3 program 3');
    assert.ok(component.cohorts[2].isChecked);
    assert.strictEqual(component.cohorts[3].title, 'name 4 program 4');
    assert.notOk(component.cohorts[3].isChecked);
  });

  test('selected cohorts toggle remove', async function (assert) {
    assert.expect(2);
    this.set('cohortProxies', [
      {
        id: 1,
        programTitle: 'program 1',
        displayTitle: 'name 1',
        classOfYear: 2015,
      },
    ]);
    this.set('remove', (id) => {
      assert.strictEqual(id, 1);
    });
    await render(hbs`<Dashboard::CohortCalendarFilter
      @cohortProxies={{this.cohortProxies}}
      @selectedIds={{array 1}}
      @add={{(noop)}}
      @remove={{this.remove}}
    />`);
    assert.ok(component.cohorts[0].isChecked);
    await component.cohorts[0].toggle();
  });

  test('unselected cohorts toggle add', async function (assert) {
    assert.expect(2);
    this.set('cohortProxies', [
      {
        id: 1,
        programTitle: 'program 1',
        displayTitle: 'name 1',
        classOfYear: 2015,
      },
    ]);
    this.set('add', (id) => {
      assert.strictEqual(id, 1);
    });
    await render(hbs`<Dashboard::CohortCalendarFilter
      @cohortProxies={{this.cohortProxies}}
      @add={{this.add}}
      @remove={{(noop)}}
    />`);
    assert.notOk(component.cohorts[0].isChecked);
    await component.cohorts[0].toggle();
  });
});
