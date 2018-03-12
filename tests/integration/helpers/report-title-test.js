import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

const { resolve } = RSVP;

module('helper:report-title', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('custom title', async function(assert) {
    assert.expect(1);
    const report = EmberObject.create({
      'title': 'Lorem Ipsum'
    });
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    assert.equal(this.element.textContent.trim(), report.get('title'));
  });

  test('all competencies in all schools', async function(assert) {
    assert.expect(1);
    const report = EmberObject.create({
      'prepositionalObject': null,
      'school': null,
      'subject': 'competency',
      'title': null,
    });
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    assert.equal(this.element.textContent.trim(), 'All Competencies in All Schools');
  });

  test('all competencies in school X', async function(assert) {
    assert.expect(1);
    const school = EmberObject.create({
      'title': 'School of Schools'
    });
    const report = EmberObject.create({
      'prepositionalObject': null,
      'school': resolve(school),
      'subject': 'competency',
      'title': null,
    });
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    assert.equal(this.element.textContent.trim(), 'All Competencies in ' + school.get('title'));
  });

  test('all competencies for user X in school Y', async function(assert) {
    assert.expect(1);
    const school = EmberObject.create({
      'title': 'School of Schools'
    });
    const pObject = EmberObject.create({
      dasherize(){
        return 'user';
      }
    });
    const report = EmberObject.create({
      'prepositionalObject': pObject,
      'school': resolve(school),
      'subject': 'competency',
      'title': null,
      'prepositionalObjectTableRowId': 1,
    });
    this.server.create('user');
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    assert.equal(this.element.textContent.trim(), 'All Competencies for 0 guy M. Mc0son in ' + school.get('title'));
  });

  test('broken report', async function(assert) {
    assert.expect(1);
    const school = EmberObject.create({
      'title': 'School of Schools'
    });
    const pObject = EmberObject.create({
      dasherize(){
        return 'user';
      }
    });
    const report = EmberObject.create({
      'prepositionalObject': pObject,
      'school': resolve(school),
      'subject': 'competency',
      'title': null,
      'prepositionalObjectTableRowId': 1,
    });
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    assert.equal(this.element.textContent.trim(), '');
  });
});
