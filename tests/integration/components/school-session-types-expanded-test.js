import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import Service from '@ember/service';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/load-common-translations";

const { resolve } = RSVP;

let storeMock;
const formative = EmberObject.create({
  id: 1,
  name: 'formative'
});
const summative = EmberObject.create({
  id: 2,
  name: 'summative'
});
const assessmentOptions = [formative, summative];

moduleForComponent('school-session-types-expanded', 'Integration | Component | school session types expanded', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  },
  beforeEach(){
    storeMock = Service.extend({
      findAll(what){
        if (what === 'assessment-option') {
          return resolve(assessmentOptions);
        }
      }
    });
    this.register('service:store', storeMock);
  }
});

const sessionType = EmberObject.create({
  id: 1,
  title: 'one',
  calendarColor: '#ffffff',
  assessment: true,
  assessmentOption: resolve(null),
});
const school = EmberObject.create({
  id: 1,
  sessionTypes: resolve([sessionType])
});

test('it renders', async function(assert) {
  this.set('school', school);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action nothing)
    expand=(action nothing)
    managedSessionTypeId=null
    setSchoolManagedSessionType=(action nothing)
  }}`);
  await wait();

  const title = '.title';
  const table = 'table';
  const sessionTypes = `${table} tbody tr`;

  assert.equal(this.$(title).text().trim(), 'Session Types');
  assert.equal(this.$(sessionTypes).length, 1);
});

test('it renders as manager', async function(assert) {
  this.set('school', school);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action nothing)
    expand=(action nothing)
    managedSessionTypeId=1
    setSchoolManagedSessionType=(action nothing)
  }}`);
  await wait();

  const title = '.title';
  const sessionTypeTitle = '.session-type-title';
  const form = '.form';
  const items = `${form} .item`;

  assert.equal(this.$(title).text().trim(), 'Session Types');
  assert.equal(this.$(sessionTypeTitle).text().trim(), 'one');
  assert.equal(this.$(items).length, 6);
});

test('editing session type fires action', async function(assert) {
  assert.expect(1);
  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', id => {
    assert.equal(id, 1);
  });
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action nothing)
    expand=(action nothing)
    managedSessionTypeId=null
    setSchoolManagedSessionType=(action click)
  }}`);
  await wait();

  const table = 'table';
  const sessionTypes = `${table} tbody tr`;
  const edit = `${sessionTypes}:eq(0) td:eq(6) .edit`;

  this.$(edit).click();
});

test('clicking expand new session fires action', async function(assert) {
  assert.expect(1);
  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', isExpanded => {
    assert.equal(isExpanded, true);
  });
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action nothing)
    expand=(action nothing)
    managedSessionTypeId=null
    setSchoolManagedSessionType=(action nothing)
  setSchoolNewSessionType=(action click)
  }}`);
  await wait();

  const edit = `.expand-collapse-button button`;

  this.$(edit).click();
});

test('close fires action', async function(assert) {
  assert.expect(1);
  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', id => {
    assert.equal(id, null);
  });
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action nothing)
    expand=(action nothing)
    managedSessionTypeId=1
    setSchoolManagedSessionType=(action click)
  }}`);
  await wait();

  const form = '.form';
  const button = `${form} .cancel`;

  this.$(button).click();
});

test('collapse fires action', async function(assert) {
  assert.expect(1);
  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', () => {
    assert.ok(true, 'action was fired');
  });
  this.render(hbs`{{school-session-types-expanded
    school=school
    canUpdate=true
    canDelete=true
    canCreate=true
    collapse=(action click)
    expand=(action nothing)
    managedSessionTypeId=null
    setSchoolManagedSessionType=(action nothing)
  }}`);
  await wait();

  const title = '.title';

  this.$(title).click();
});
