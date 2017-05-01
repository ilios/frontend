import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject, RSVP, String:EmberString } = Ember;
const { htmlSafe } = EmberString;
const { resolve } = RSVP;

moduleForComponent('school-session-types-list', 'Integration | Component | school session types list', {
  integration: true
});

test('it renders', async function(assert) {
  assert.expect(12);
  let assessmentOption = EmberObject.create({
    id: 1,
    name: 'formative'
  });
  let  sessionType1 = EmberObject.create({
    id: 1,
    school: 1,
    title: 'first',
    assessment: false,
    assessmentOption: resolve(null),
    safeCalendarColor: htmlSafe('#ffffff'),
    sessionCount: 2,
  });

  let  sessionType2 = EmberObject.create({
    id: 2,
    school: 1,
    title: 'second',
    assessment: true,
    assessmentOption: resolve(assessmentOption),
    safeCalendarColor: htmlSafe('#123456'),
    sessionCount: 0,
  });


  this.set('sessionTypes', [sessionType1, sessionType2]);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-types-list
    sessionTypes=sessionTypes
    manageSessionType=(action nothing)
  }}`);

  await wait();

  const rows = 'table tbody tr';
  const firstSessionType = `${rows}:eq(0)`;
  const firstTitle = `${firstSessionType} td:eq(0)`;
  const firstSessionCount = `${firstSessionType} td:eq(1)`;
  const firstAssessment = `${firstSessionType} td:eq(2) i`;
  const firstAssessmentOption = `${firstSessionType} td:eq(3)`;
  const firstColorBox = `${firstSessionType} td:eq(4) .box`;
  const secondSessionType = `${rows}:eq(1)`;
  const secondTitle = `${secondSessionType} td:eq(0)`;
  const secondSessionCount = `${secondSessionType} td:eq(1)`;
  const secondAssessment = `${secondSessionType} td:eq(2) i`;
  const secondAssessmentOption = `${secondSessionType} td:eq(3)`;
  const secondColorBox = `${secondSessionType} td:eq(4) .box`;

  assert.equal(this.$(firstTitle).text().trim(), 'first');
  assert.equal(this.$(firstSessionCount).text().trim(), '2');
  assert.ok(this.$(firstAssessment).hasClass('no'));
  assert.ok(this.$(firstAssessment).hasClass('fa-ban'));
  assert.equal(this.$(firstAssessmentOption).text().trim(), '');
  assert.equal(this.$(firstColorBox).css('background-color').trim(), ('rgb(255, 255, 255)'));

  assert.equal(this.$(secondTitle).text().trim(), 'second');
  assert.equal(this.$(secondSessionCount).text().trim(), '0');
  assert.ok(this.$(secondAssessment).hasClass('yes'));
  assert.ok(this.$(secondAssessment).hasClass('fa-check'));
  assert.equal(this.$(secondAssessmentOption).text().trim(), 'formative');
  assert.equal(this.$(secondColorBox).css('background-color').trim(), ('rgb(18, 52, 86)'));
});

test('clicking edit fires action', async function(assert) {
  assert.expect(1);
  let  sessionType = EmberObject.create({
    id: 1,
    school: 1,
    title: 'first',
    assessment: false,
    assessmentOption: resolve(null),
    calendarColor: '#fff'
  });

  this.set('sessionTypes', [sessionType]);
  this.set('manageSessionType', sessionTypeId => {
    assert.equal(sessionTypeId, 1);
  });
  this.render(hbs`{{school-session-types-list
    sessionTypes=sessionTypes
    manageSessionType=(action manageSessionType)
  }}`);

  await wait();
  const rows = 'table tbody tr';
  const edit = `${rows}:eq(0) td:eq(5) .clickable`;

  this.$(edit).click();
});

test('clicking title fires action', async function(assert) {
  assert.expect(1);
  let  sessionType = EmberObject.create({
    id: 1,
    school: 1,
    title: 'first',
    assessment: false,
    assessmentOption: resolve(null),
    calendarColor: '#fff'
  });

  this.set('sessionTypes', [sessionType]);
  this.set('manageSessionType', sessionTypeId => {
    assert.equal(sessionTypeId, 1);
  });
  this.render(hbs`{{school-session-types-list
    sessionTypes=sessionTypes
    manageSessionType=(action manageSessionType)
  }}`);

  await wait();
  const rows = 'table tbody tr';
  const title = `${rows}:eq(0) td:eq(0) a`;

  this.$(title).click();
});
