import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/load-common-translations";

moduleForComponent('school-session-attributes', 'Integration | Component | school session attributes', {
  integration: true,
  setup(){
    initializer.initialize(getOwner(this));
  },
});

test('it renders collapsed', async function(assert) {
  assert.expect(13);
  const school = EmberObject.create({
    async getConfigValue(name){
      if (name === 'showSessionSupplemental') {
        return true;
      }

      return false;
    },
  });

  this.set('school', school);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-attributes
    school=school
    manage=(action nothing)
    collapse=(action nothing)
    expand=(action nothing)
  }}`);
  await wait();

  const rows = 'table tbody tr';
  const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
  const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
  const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
  const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
  const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
  const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
  const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
  const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;
  const classname = `.school-session-attributes-collapsed`;

  assert.equal(this.$(attendanceTitle).text().trim(), 'Attendance Required');
  assert.ok(this.$(attendanceEnabled).hasClass('no'));
  assert.ok(this.$(attendanceEnabled).hasClass('fa-ban'));

  assert.equal(this.$(supplementalTitle).text().trim(), 'Supplemental Curriculum');
  assert.ok(this.$(supplementalEnabled).hasClass('yes'));
  assert.ok(this.$(supplementalEnabled).hasClass('fa-check'));

  assert.equal(this.$(specialAttireTitle).text().trim(), 'Special Attire Required');
  assert.ok(this.$(specialAttireEnabled).hasClass('no'));
  assert.ok(this.$(specialAttireEnabled).hasClass('fa-ban'));

  assert.equal(this.$(specialEquipmentTitle).text().trim(), 'Special Equipment Required');
  assert.ok(this.$(specialEquipmentEnabled).hasClass('no'));
  assert.ok(this.$(specialEquipmentEnabled).hasClass('fa-ban'));

  assert.equal(this.$(classname).length, 1);
});

test('it renders expanded', async function(assert) {
  assert.expect(13);
  const school = EmberObject.create({
    async getConfigValue(name){
      if (name === 'showSessionSupplemental') {
        return true;
      }

      return false;
    },
  });

  this.set('school', school);
  this.set('nothing', parseInt);
  this.render(hbs`{{school-session-attributes
    school=school
    details=true
    manage=(action nothing)
    collapse=(action nothing)
    expand=(action nothing)
  }}`);
  await wait();

  const rows = 'table tbody tr';
  const attendanceTitle = `${rows}:eq(0) td:eq(0)`;
  const attendanceEnabled = `${rows}:eq(0) td:eq(1) i`;
  const supplementalTitle = `${rows}:eq(1) td:eq(0)`;
  const supplementalEnabled = `${rows}:eq(1) td:eq(1) i`;
  const specialAttireTitle = `${rows}:eq(2) td:eq(0)`;
  const specialAttireEnabled = `${rows}:eq(2) td:eq(1) i`;
  const specialEquipmentTitle = `${rows}:eq(3) td:eq(0)`;
  const specialEquipmentEnabled = `${rows}:eq(3) td:eq(1) i`;
  const classname = `.school-session-attributes-expanded`;

  assert.equal(this.$(attendanceTitle).text().trim(), 'Attendance Required');
  assert.ok(this.$(attendanceEnabled).hasClass('no'));
  assert.ok(this.$(attendanceEnabled).hasClass('fa-ban'));

  assert.equal(this.$(supplementalTitle).text().trim(), 'Supplemental Curriculum');
  assert.ok(this.$(supplementalEnabled).hasClass('yes'));
  assert.ok(this.$(supplementalEnabled).hasClass('fa-check'));

  assert.equal(this.$(specialAttireTitle).text().trim(), 'Special Attire Required');
  assert.ok(this.$(specialAttireEnabled).hasClass('no'));
  assert.ok(this.$(specialAttireEnabled).hasClass('fa-ban'));

  assert.equal(this.$(specialEquipmentTitle).text().trim(), 'Special Equipment Required');
  assert.ok(this.$(specialEquipmentEnabled).hasClass('no'));
  assert.ok(this.$(specialEquipmentEnabled).hasClass('fa-ban'));
  assert.equal(this.$(classname).length, 1);
});

test('clicking expand fires action', async function(assert) {
  assert.expect(1);
  const school = EmberObject.create({
    async getConfigValue(){
      return false;
    },
  });

  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', () => {
    assert.ok(true, 'action fired');
  });
  this.render(hbs`{{school-session-attributes
    school=school
    manage=(action nothing)
    collapse=(action nothing)
    expand=(action click)
  }}`);
  await wait();

  const title = '.title';
  await this.$(title).click();
});

test('clicking collapse fires action', async function(assert) {
  assert.expect(1);
  const school = EmberObject.create({
    async getConfigValue(){
      return false;
    },
  });

  this.set('school', school);
  this.set('nothing', parseInt);
  this.set('click', () => {
    assert.ok(true, 'action fired');
  });
  this.render(hbs`{{school-session-attributes
    school=school
    details=true
    manage=(action nothing)
    collapse=(action click)
    expand=(action nothing)
  }}`);
  await wait();

  const title = '.title';
  await this.$(title).click();
});
