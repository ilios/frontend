import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  findAll,
  fillIn,
  triggerEvent
} from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory report header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let report = EmberObject.create({
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report canUpdate=true}}`);
    assert.dom('.title').hasText(report.name, 'Report name shows.');
    assert.dom('.editable').exists({ count: 1 }, 'Report name is editable.');
    assert.dom(`.actions .finalize`).exists({ count: 1 }, 'Finalize button shows.');
    assert.dom(`.actions .download`).exists({ count: 1 }, 'Download button shows.');
  });

  test('non updatable reports render in read-only mode.', async function(assert) {
    let report = EmberObject.create({
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report canUpdate=false}}`);
    assert.dom('.title .fa-lock').exists({ count: 1 }, 'Lock icon is showing in title.');
    assert.dom('.editable').doesNotExist('Report name is not editable.');
    assert.dom('.actions .download').exists({ count: 1 }, 'Download button shows.');
    assert.dom(`.actions .finalize:disabled`).exists({ count: 1 }, 'Finalize button is disabled.');
  });

  test('change name', async function(assert) {
    assert.expect(3);
    const newName = 'new name';
    let report = EmberObject.create({
      isFinalized: false,
      absoluteFileUri: 'foo/bar',
      name: 'old name',
      save(){
        assert.equal(this.get('name'), 'new name');
        return resolve(this);
      }
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report canUpdate=true}}`);
    assert.dom('.editinplace').hasText(report.name);
    await click('.editable');
    await fillIn('.editinplace input', newName);
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    assert.dom('.editinplace').hasText(newName);
  });

  test('change name fails on empty value', async function(assert) {
    assert.expect(2);
    let report = EmberObject.create({
      isFinalized: false,
      absoluteFileUri: 'foo/bar',
      name: 'old name',
      save(){
        assert.ok(false, 'Save action should not have been invoked.');
      }
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report canUpdate=true}}`);
    await click('.editable');
    assert.dom('.validation-error-message').doesNotExist('No validation error shown initially.');
    await fillIn('.editinplace input', '');
    await triggerEvent('.editinplace input', 'input');
    await click('.editinplace .done');
    assert.ok(findAll('.validation-error-message').length, 1, 'Validation error shows.');
  });

  test('clicking on finalize button fires action', async function(assert) {
    assert.expect(1);
    let report = EmberObject.create({
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    let finalizeAction = function() {
      assert.ok(true, 'Finalize action was invoked.');
    };
    this.set('report', report);
    this.set('finalizeAction', finalizeAction);
    await render(
      hbs`{{curriculum-inventory-report-header report=report canUpdate=true finalize=(action finalizeAction)}}`
    );
    await click('button.finalize');
  });
});
