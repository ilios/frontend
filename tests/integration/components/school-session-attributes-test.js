import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | school session attributes', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders collapsed', async function(assert) {
    assert.expect(13);
    const school = this.server.create('school');
    this.server.create('school-config', {
      name: 'showSessionSupplemental',
      value: true,
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @manage={{noop}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

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

    assert.dom(attendanceTitle).hasText('Attendance Required');
    assert.dom(attendanceEnabled).hasClass('no');
    assert.dom(attendanceEnabled).hasClass('fa-ban');

    assert.dom(supplementalTitle).hasText('Supplemental Curriculum');
    assert.dom(supplementalEnabled).hasClass('yes');
    assert.dom(supplementalEnabled).hasClass('fa-check');

    assert.dom(specialAttireTitle).hasText('Special Attire Required');
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.dom(specialEquipmentTitle).hasText('Special Equipment Required');
    assert.dom(specialEquipmentEnabled).hasClass('no');
    assert.dom(specialEquipmentEnabled).hasClass('fa-ban');

    assert.dom(classname).exists({ count: 1 });
  });

  test('it renders expanded', async function(assert) {
    assert.expect(13);
    const school = this.server.create('school');
    this.server.create('school-config', {
      name: 'showSessionSupplemental',
      value: true,
      school,
    });
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @details={{true}}
      @manage={{noop}}
      @collapse={{noop}}
      @expand={{noop}}
    />`);

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

    assert.dom(attendanceTitle).hasText('Attendance Required');
    assert.dom(attendanceEnabled).hasClass('no');
    assert.dom(attendanceEnabled).hasClass('fa-ban');

    assert.dom(supplementalTitle).hasText('Supplemental Curriculum');
    assert.dom(supplementalEnabled).hasClass('yes');
    assert.dom(supplementalEnabled).hasClass('fa-check');

    assert.dom(specialAttireTitle).hasText('Special Attire Required');
    assert.dom(specialAttireEnabled).hasClass('no');
    assert.dom(specialAttireEnabled).hasClass('fa-ban');

    assert.dom(specialEquipmentTitle).hasText('Special Equipment Required');
    assert.dom(specialEquipmentEnabled).hasClass('no');
    assert.dom(specialEquipmentEnabled).hasClass('fa-ban');
    assert.dom(classname).exists({ count: 1 });
  });

  test('clicking expand fires action', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('click', () => {
      assert.ok(true, 'action fired');
    });
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @manage={{noop}}
      @collapse={{noop}}
      @expand={{action click}}
    />`);

    const title = '.title';
    await click(title);
  });

  test('clicking collapse fires action', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('click', () => {
      assert.ok(true, 'action fired');
    });
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @details={{true}}
      @manage={{noop}}
      @collapse={{action click}}
      @expand={{noop}}
    />`);

    const title = '.title';
    await click(title);
  });
});
