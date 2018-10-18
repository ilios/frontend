import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | dashbaord view picker', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const week = '[data-test-glance]';
    const activities = '[data-test-activities';
    const materials = '[data-test-materials]';
    const calendar = '[data-test-calendar]';

    this.set('nothing', parseInt);
    this.set('show', 'week');
    await render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

    assert.equal(find(week).textContent.trim(), 'Week at a Glance');
    assert.ok(find(week).classList.contains('active'));
    assert.equal(find(activities).textContent.trim(), 'Activities');
    assert.notOk(find(activities).classList.contains('active'));
    assert.equal(find(materials).textContent.trim(), 'Materials');
    assert.notOk(find(materials).classList.contains('active'));
    assert.equal(find(calendar).textContent.trim(), 'Calendar');
    assert.notOk(find(calendar).classList.contains('active'));
  });

  test('changing show changes active button', async function(assert) {
    const week = '[data-test-glance]';
    const activities = '[data-test-activities';
    const materials = '[data-test-materials]';
    const calendar = '[data-test-calendar]';

    this.set('nothing', parseInt);
    this.set('show', 'week');
    await render(hbs`{{dashboard-view-picker show=show change=(action nothing)}}`);

    assert.ok(find(week).classList.contains('active'));
    assert.notOk(find(activities).classList.contains('active'));
    assert.notOk(find(materials).classList.contains('active'));
    assert.notOk(find(calendar).classList.contains('active'));

    this.set('show', 'agenda');
    assert.notOk(find(week).classList.contains('agenda'));
    assert.ok(find(activities).classList.contains('active'));
    assert.notOk(find(materials).classList.contains('active'));
    assert.notOk(find(calendar).classList.contains('active'));

    this.set('show', 'materials');
    assert.notOk(find(week).classList.contains('agenda'));
    assert.notOk(find(activities).classList.contains('active'));
    assert.ok(find(materials).classList.contains('active'));
    assert.notOk(find(calendar).classList.contains('active'));

    this.set('show', 'calendar');
    assert.notOk(find(week).classList.contains('agenda'));
    assert.notOk(find(activities).classList.contains('active'));
    assert.notOk(find(materials).classList.contains('active'));
    assert.ok(find(calendar).classList.contains('active'));
  });

  test('clicking week fires action', async function(assert) {
    assert.expect(2);
    const week = '[data-test-glance]';

    this.set('click', what => {
      assert.equal(what, 'week');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.notOk(find(week).classList.contains('active'));
    find(week).click();
  });

  test('clicking activities fires action', async function(assert) {
    assert.expect(2);
    const activities = '[data-test-activities';

    this.set('click', what => {
      assert.equal(what, 'agenda');
    });
    this.set('show', 'materials');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.notOk(find(activities).classList.contains('active'));
    find(activities).click();
  });

  test('clicking materials fires action', async function(assert) {
    assert.expect(2);
    const materials = '[data-test-materials]';

    this.set('click', what => {
      assert.equal(what, 'materials');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.notOk(find(materials).classList.contains('active'));
    find(materials).click();
  });

  test('clicking activities fires action', async function(assert) {
    assert.expect(2);
    const calendar = '[data-test-calendar]';

    this.set('click', what => {
      assert.equal(what, 'calendar');
    });
    this.set('show', 'agenda');
    await render(hbs`{{dashboard-view-picker show=show change=(action click)}}`);

    assert.notOk(find(calendar).classList.contains('active'));
    find(calendar).click();
  });
});
