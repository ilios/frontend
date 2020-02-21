import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { component as weeklyCalendarComponent } from 'ilios-common/page-objects/components/weekly-calendar';

module('Integration | Component | ilios calendar week', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(2);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);

    await render(hbs`<IliosCalendarWeek @date={{this.date}} />`);
    assert.dom().containsText('Week of September 27th 2015');
    assert.equal(weeklyCalendarComponent.events.length, 0);
  });

  test('clicking on a day header fires the correct events', async function(assert) {
    assert.expect(3);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.actions.changeDate = newDate => {
      assert.ok(newDate instanceof Date);
      assert.ok(newDate.toString().search(/Sun Sep 27/) === 0);
    };
    this.actions.changeView = newView => {
      assert.equal(newView, 'day');
    };

    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @areDaysSelectable={{true}}
      @changeDate={{action "changeDate"}}
      @changeView={{action "changeView"}}
    />`);
    weeklyCalendarComponent.dayHeadings[0].selectDay();
  });

  test('clicking on a day header does nothing when areDaysSelectable is false', async function(assert) {
    assert.expect(0);
    const date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('nothing', () => {
      assert.ok(false, 'this should never be called');
    });

    await render(hbs`<IliosCalendarWeek
      @date={{this.date}}
      @areDaysSelectable={{false}}
      @changeDate={{this.nothing}}
      @changeView={{this.nothing}}
    />`);
    await weeklyCalendarComponent.dayHeadings[0].selectDay();
  });
});
