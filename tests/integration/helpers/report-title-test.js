import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve, reject } = RSVP;

module('helper:report-title', function(hooks) {
  setupRenderingTest(hooks);

  test('custom title', async function(assert) {
    assert.expect(1);
    const report = EmberObject.create({
      'title': 'Lorem Ipsum'
    });
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    return settled().then(()=>{
      assert.equal(this.$().text().trim(), report.get('title'));
    });
  });

  test('all competencies in all schools', async function(assert) {
    assert.expect(1);
    const report = EmberObject.create({
      'prepositionalObject': null,
      'school': null,
      'subject': 'competency',
      'title': null,
    });
    const storeMock = Service.extend({});
    this.owner.register('service:store', storeMock);
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    return settled().then(()=>{
      assert.equal(this.$().text().trim(), 'All Competencies in All Schools');
    });
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
    const storeMock = Service.extend({});
    this.owner.register('service:store', storeMock);
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    return settled().then(()=>{
      assert.equal(this.$().text().trim(), 'All Competencies in ' + school.get('title'));
    });
  });

  test('all competencies for user X in school Y', async function(assert) {
    assert.expect(3);
    const school = EmberObject.create({
      'title': 'School of Schools'
    });
    const pObject = EmberObject.create({
      dasherize(){
        return 'user';
      }
    });
    const userRecord = EmberObject.create({
      fullName: 'Chip Whitley',
    });
    const report = EmberObject.create({
      'prepositionalObject': pObject,
      'school': resolve(school),
      'subject': 'competency',
      'title': null,
      'prepositionalObjectTableRowId': 1,
    });

    const storeMock = Service.extend({
      findRecord(model, id) {
        assert.equal(model, 'user');
        assert.equal(id, 1);
        return resolve(userRecord);
      }
    });

    this.owner.register('service:store', storeMock);
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    return settled().then(()=>{
      assert.equal(this.$().text().trim(), 'All Competencies for ' + userRecord.get('fullName') +  ' in ' + school.get('title'));
    });
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
    const storeMock = Service.extend({
      findRecord() {
        return reject(new Error('not found'));
      }
    });
    this.owner.register('service:store', storeMock);
    this.set('report', report);
    await render(hbs`{{report-title report}}`);
    return settled().then(()=>{
      assert.equal(this.$().text().trim(), '');
    });
  });
});
