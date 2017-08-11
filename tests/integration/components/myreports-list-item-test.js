import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Service, RSVP, Object:EmberObject } = Ember;
const { resolve, reject } = RSVP;

moduleForComponent('myreports-list-item', 'Integration | Component | myreports list item', {
  integration: true
});

test('custom title', function(assert) {
  assert.expect(3);
  const report = EmberObject.create({
    'title': 'Lorem Ipsum'
  });
  this.set('report', report);
  this.on('selectReport', (param) => {
    assert.equal(param, report);
  });
  this.render(hbs`{{myreports-list-item report=report selectReport='selectReport'}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), report.get('title'));
    assert.equal(this.$('.clickable').length, 1);
    this.$('.clickable').click();
  });
});

test('all competencies in all schools', function(assert) {
  assert.expect(3);
  const report = EmberObject.create({
    'prepositionalObject': null,
    'school': null,
    'subject': 'competency',
    'title': null,
  });
  const storeMock = Service.extend({});
  this.register('service:store', storeMock);
  this.set('report', report);
  this.on('selectReport', (param) => {
    assert.equal(param, report);
  });
  this.render(hbs`{{myreports-list-item report=report selectReport='selectReport'}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'All Competencies in All Schools');
    assert.equal(this.$('.clickable').length, 1);
    this.$('.clickable').click();
  });
});

test('all competencies in school X', function(assert) {
  assert.expect(2);
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
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{myreports-list-item report=report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'All Competencies in ' + school.get('title'));
    assert.equal(this.$('.clickable').length, 1);
  });
});

test('all competencies for user X in school Y', function(assert) {
  assert.expect(4);
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

  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{myreports-list-item report=report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'All Competencies for ' + userRecord.get('fullName') +  ' in ' + school.get('title'));
    assert.equal(this.$('.clickable').length, 1);
  });
});

test('broken report', function(assert) {
  assert.expect(2);
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
  this.register('service:store', storeMock);
  this.set('report', report);
  this.render(hbs`{{myreports-list-item report=report}}`);
  return wait().then(()=>{
    assert.equal(this.$().text().trim(), 'This report is no longer available.');
    assert.equal(this.$('.clickable').length, 0);
  });
});
