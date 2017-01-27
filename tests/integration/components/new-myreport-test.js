import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
const { RSVP, Service, Object } = Ember;
const { resolve } = RSVP;

moduleForComponent('new-myreport', 'Integration | Component | new myreport', {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(29);

  const mockSchools = [
    {id: 2, title: 'second'},
    {id: 1, title: 'first'},
    {id: 3, title: 'third'},
  ];
  const mockUser = Object.create({
    schools: resolve(mockSchools),
    school: resolve(Object.create(mockSchools[0]))
  });

  const currentUserMock = Service.extend({
    model: resolve(mockUser)
  });
  this.register('service:current-user', currentUserMock);


  this.on('close', parseInt);
  this.render(hbs`{{new-myreport close=(action 'close')}}`);
  const title = '.title';
  const schools = 'select:eq(0) option';
  const allSchools = `${schools}:eq(0)`;
  const firstSchool = `${schools}:eq(1)`;
  const secondSchool = `${schools}:eq(2)`;
  const thirdSchool = `${schools}:eq(3)`;

  const subjects = 'select:eq(1) option';
  const firstSubject = `${subjects}:eq(0)`;
  const secondSubject = `${subjects}:eq(1)`;
  const thirdSubject = `${subjects}:eq(2)`;
  const fourthSubject = `${subjects}:eq(3)`;
  const fifthSubject = `${subjects}:eq(4)`;
  const sixthSubject = `${subjects}:eq(5)`;
  const seventhSubject = `${subjects}:eq(6)`;
  const eighthSubject = `${subjects}:eq(7)`;
  const ninthSubject = `${subjects}:eq(8)`;
  const tenthSubject = `${subjects}:eq(9)`;


  assert.equal(this.$(title).text(), 'New Report');
  assert.notEqual(this.$(allSchools).text().search(/All Schools/), -1);
  assert.equal(this.$(allSchools).val(), "null");
  assert.notEqual(this.$(firstSchool).text().search(/first/), -1);
  assert.equal(this.$(firstSchool).val(), 1);
  assert.notEqual(this.$(secondSchool).text().search(/second/), -1);
  assert.equal(this.$(secondSchool).val(), 2);
  assert.notEqual(this.$(thirdSchool).text().search(/third/), -1);
  assert.equal(this.$(thirdSchool).val(), 3);

  assert.equal(this.$(firstSubject).text().trim(), 'Courses');
  assert.equal(this.$(firstSubject).val(), 'course');
  assert.equal(this.$(secondSubject).text().trim(), 'Sessions');
  assert.equal(this.$(secondSubject).val(), 'session');
  assert.equal(this.$(thirdSubject).text().trim(), 'Programs');
  assert.equal(this.$(thirdSubject).val(), 'program');
  assert.equal(this.$(fourthSubject).text().trim(), 'Program Years');
  assert.equal(this.$(fourthSubject).val(), 'program year');
  assert.equal(this.$(fifthSubject).text().trim(), 'Instructors');
  assert.equal(this.$(fifthSubject).val(), 'instructor');
  assert.equal(this.$(sixthSubject).text().trim(), 'Instructor Groups');
  assert.equal(this.$(sixthSubject).val(), 'instructor group');
  assert.equal(this.$(seventhSubject).text().trim(), 'Learning Materials');
  assert.equal(this.$(seventhSubject).val(), 'learning material');
  assert.equal(this.$(eighthSubject).text().trim(), 'Competencies');
  assert.equal(this.$(eighthSubject).val(), 'competency');
  assert.equal(this.$(ninthSubject).text().trim(), 'MeSH Terms');
  assert.equal(this.$(ninthSubject).val(), 'mesh term');
  assert.equal(this.$(tenthSubject).text().trim(), 'Session Types');
  assert.equal(this.$(tenthSubject).val(), 'session type');
});

let checkObjects = function(context, assert, subjectNum, subjectVal, expectedObjects){
  assert.expect(expectedObjects.length + 2);
  const mockSchools = [{id: 2, title: 'second'}];
  const mockUser = Object.create({
    schools: resolve(mockSchools),
    school: resolve(Object.create(mockSchools[0]))
  });

  const currentUserMock = Service.extend({
    model: resolve(mockUser)
  });
  context.register('service:current-user', currentUserMock);
  context.on('close', parseInt);
  context.render(hbs`{{new-myreport close=(action 'close')}}`);

  const select = `select:eq(1)`;
  const subjects = `${select} option`;
  const targetSubject = `${subjects}:eq(${subjectNum})`;

  const objectsOptions = 'select:eq(2) option';

  assert.equal(context.$(targetSubject).val(), subjectVal);
  context.$(select).val(subjectVal).change();

  assert.equal(context.$(`${objectsOptions}:eq(0)`).val(), '');
  expectedObjects.forEach((val, i) => {
    assert.equal(context.$(`${objectsOptions}:eq(${i+1})`).val(), val);
  });
};

test('choosing course selects correct objects', function(assert) {
  return checkObjects(this, assert, 0, 'course', [
    'session',
    'program',
    'instructor',
    'instructor group',
    'learning material',
    'competency',
    'mesh term',
  ]);
});

test('choosing session selects correct objects', function(assert) {
  return checkObjects(this, assert, 1, 'session', [
    'course',
    'program',
    'instructor',
    'instructor group',
    'learning material',
    'competency',
    'mesh term',
    'session type',
  ]);
});

test('choosing programs selects correct objects', function(assert) {
  return checkObjects(this, assert, 2, 'program', ['course', 'session']);
});

test('choosing program years selects correct objects', function(assert) {
  return checkObjects(this, assert, 3, 'program year', ['course', 'session']);
});

test('choosing instructor selects correct objects', function(assert) {
  return checkObjects(this, assert, 4, 'instructor', [
    'course',
    'session',
    'instructor group',
    'learning material',
    'session type',
  ]);
});

test('choosing instructor group selects correct objects', function(assert) {
  return checkObjects(this, assert, 5, 'instructor group', [
    'course',
    'session',
    'instructor',
    'learning material',
    'session type',
  ]);
});

test('choosing learning material selects correct objects', function(assert) {
  return checkObjects(this, assert, 6, 'learning material', [
    'course',
    'session',
    'instructor',
    'instructor group',
    'mesh term',
    'session type',
  ]);
});

test('choosing competency selects correct objects', function(assert) {
  return checkObjects(this, assert, 7, 'competency', [
    'course',
    'session',
    'session type',
  ]);
});

test('choosing mesh term selects correct objects', function(assert) {
  return checkObjects(this, assert, 8, 'mesh term', [
    'course',
    'session',
    'learning material',
    'session type',
  ]);
});

test('choosing session type selects correct objects', function(assert) {
  return checkObjects(this, assert, 9, 'session type', [
    'course',
    'program',
    'instructor',
    'instructor group',
    'learning material',
    'competency',
    'mesh term',
  ]);
});
