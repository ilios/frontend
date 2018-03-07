import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory report header', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let report = EmberObject.create({
      isFinalized: false,
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report}}`);
    assert.equal(this.$('.title').text().trim(), report.name, 'Report name shows.');
    assert.equal(this.$('.editable').length, 1, 'Report name is editable.');
    assert.equal(this.$(`.actions .finalize`).length, 1, 'Finalize button shows.');
    assert.equal(this.$(`.actions .download`).length, 1, 'Download button shows.');
  });

  test('finalized reports render in read-only mode.', async function(assert) {
    let report = EmberObject.create({
      isFinalized: true,
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    this.set('report', report);
    await render(hbs`{{curriculum-inventory-report-header report=report}}`);
    assert.equal(this.$('.title .fa-lock').length, 1, 'Lock icon is showing in title.');
    assert.equal(this.$('.editable').length, 0, 'Report name is not editable.');
    assert.equal(this.$('.actions .download').length, 1, 'Download button shows.');
    assert.equal(this.$(`.actions .finalize`).length, 0, 'Finalize button is not showing.');
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
    await render(hbs`{{curriculum-inventory-report-header report=report}}`);
    assert.equal(this.$('.editinplace').text().trim(), report.name);
    this.$('.editable').click();
    this.$('.editinplace input').val(newName);
    this.$('.editinplace input').trigger('input');
    this.$('.editinplace .done').click();
    return settled().then(() => {
      assert.equal(this.$('.editinplace').text().trim(), newName);
    });
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
    await render(hbs`{{curriculum-inventory-report-header report=report}}`);
    this.$('.editable').click();
    assert.equal(this.$('.validation-error-message').length, 0, 'No validation error shown initially.');
    this.$('.editinplace input').val('');
    this.$('.editinplace input').trigger('input');
    this.$('.editinplace .done').click();
    return settled().then(() => {
      assert.ok(this.$('.validation-error-message').length, 1, 'Validation error shows.');
    });
  });

  test('clicking on finalize button fires action', async function(assert) {
    assert.expect(1);
    let report = EmberObject.create({
      isFinalized: false,
      absoluteFileUri: 'foo/bar',
      name: 'Report name'
    });
    let finalizeAction = function() {
      assert.ok(true, 'Finalize action was invoked.');
    };
    this.set('report', report);
    this.set('finalizeAction', finalizeAction);
    await render(hbs`{{curriculum-inventory-report-header report=report finalize=(action finalizeAction)}}`);
    return settled().then(()=>{
      this.$('button.finalize').click();
    });
  });
});
