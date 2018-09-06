import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | school session attributes', function(hooks) {
  setupRenderingTest(hooks);

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
    await render(hbs`{{school-session-attributes
      school=school
      manage=(action nothing)
      collapse=(action nothing)
      expand=(action nothing)
    }}`);
    await settled();

    const rows = 'table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;
    const classname = `.school-session-attributes-collapsed`;

    assert.equal(find(attendanceTitle).textContent.trim(), 'Attendance Required');
    assert.ok(find(attendanceEnabled).hasClass('no'));
    assert.ok(find(attendanceEnabled).hasClass('fa-ban'));

    assert.equal(find(supplementalTitle).textContent.trim(), 'Supplemental Curriculum');
    assert.ok(find(supplementalEnabled).hasClass('yes'));
    assert.ok(find(supplementalEnabled).hasClass('fa-check'));

    assert.equal(find(specialAttireTitle).textContent.trim(), 'Special Attire Required');
    assert.ok(find(specialAttireEnabled).hasClass('no'));
    assert.ok(find(specialAttireEnabled).hasClass('fa-ban'));

    assert.equal(find(specialEquipmentTitle).textContent.trim(), 'Special Equipment Required');
    assert.ok(find(specialEquipmentEnabled).hasClass('no'));
    assert.ok(find(specialEquipmentEnabled).hasClass('fa-ban'));

    assert.equal(findAll(classname).length, 1);
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
    await render(hbs`{{school-session-attributes
      school=school
      details=true
      manage=(action nothing)
      collapse=(action nothing)
      expand=(action nothing)
    }}`);
    await settled();

    const rows = 'table tbody tr';
    const attendanceTitle = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const attendanceEnabled = `${rows}:nth-of-type(1) td:nth-of-type(2) svg`;
    const supplementalTitle = `${rows}:nth-of-type(2) td:nth-of-type(1)`;
    const supplementalEnabled = `${rows}:nth-of-type(2) td:nth-of-type(2) svg`;
    const specialAttireTitle = `${rows}:nth-of-type(3) td:nth-of-type(1)`;
    const specialAttireEnabled = `${rows}:nth-of-type(3) td:nth-of-type(2) svg`;
    const specialEquipmentTitle = `${rows}:nth-of-type(4) td:nth-of-type(1)`;
    const specialEquipmentEnabled = `${rows}:nth-of-type(4) td:nth-of-type(2) svg`;
    const classname = `.school-session-attributes-expanded`;

    assert.equal(find(attendanceTitle).textContent.trim(), 'Attendance Required');
    assert.ok(find(attendanceEnabled).hasClass('no'));
    assert.ok(find(attendanceEnabled).hasClass('fa-ban'));

    assert.equal(find(supplementalTitle).textContent.trim(), 'Supplemental Curriculum');
    assert.ok(find(supplementalEnabled).hasClass('yes'));
    assert.ok(find(supplementalEnabled).hasClass('fa-check'));

    assert.equal(find(specialAttireTitle).textContent.trim(), 'Special Attire Required');
    assert.ok(find(specialAttireEnabled).hasClass('no'));
    assert.ok(find(specialAttireEnabled).hasClass('fa-ban'));

    assert.equal(find(specialEquipmentTitle).textContent.trim(), 'Special Equipment Required');
    assert.ok(find(specialEquipmentEnabled).hasClass('no'));
    assert.ok(find(specialEquipmentEnabled).hasClass('fa-ban'));
    assert.equal(findAll(classname).length, 1);
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
    await render(hbs`{{school-session-attributes
      school=school
      manage=(action nothing)
      collapse=(action nothing)
      expand=(action click)
    }}`);
    await settled();

    const title = '.title';
    await await click(title);
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
    await render(hbs`{{school-session-attributes
      school=school
      details=true
      manage=(action nothing)
      collapse=(action click)
      expand=(action nothing)
    }}`);
    await settled();

    const title = '.title';
    await await click(title);
  });
});
