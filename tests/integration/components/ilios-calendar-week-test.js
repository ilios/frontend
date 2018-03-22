import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | ilios calendar week', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  test('it renders', async function(assert) {
    assert.expect(2);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);

    await render(hbs`{{ilios-calendar-week date=date}}`);
    assert.equal(this.element.textContent.trim().search(/^Week of September/), 0);
    assert.equal(this.element.querySelectorAll('.event').length, 0);
  });

  test('clicking on a day header fires the correct events', async function(assert) {
    assert.expect(4);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.actions.changeDate = newDate => {
      assert.ok(newDate instanceof Date);
      assert.ok(newDate.toString().search(/Sun Sep 27/) === 0);
    };
    this.actions.changeView = newView => {
      assert.equal(newView, 'day');
    };

    await render(hbs`{{ilios-calendar-week
      date=date
      changeDate=(action 'changeDate')
      changeView=(action 'changeView')
    }}`);

    const weekTitles = '.week-titles .cell';
    const sunday = `${weekTitles}:nth-of-type(2)`;

    assert.ok(this.$(sunday).hasClass('clickable'));

    this.$(sunday).click();
  });

  test('clicking on a day header does nothing when areDaysSelectable is false', async function(assert) {
    assert.expect(1);
    let date = new Date('2015-09-30T12:00:00');
    this.set('date', date);
    this.set('nothing', () => {
      assert.ok(false, 'this should never be called');
    });

    await render(hbs`{{ilios-calendar-week
      date=date
      areDaysSelectable=false
      changeDate=(action nothing)
      changeView=(action nothing)
    }}`);

    const weekTitles = '.week-titles .cell';
    const sunday = `${weekTitles}:nth-of-type(2)`;

    assert.notOk(this.$(sunday).hasClass('clickable'));

    this.$(sunday).click();
  });
});
