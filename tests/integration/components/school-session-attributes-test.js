import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/school-session-attributes';

module('Integration | Component | school session attributes', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders collapsed', async function (assert) {
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
      @manage={{(noop)}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.notOk(component.expanded.isVisible);
    assert.notOk(component.collapsed.attendanceRequired.isEnabled);
    assert.ok(component.collapsed.supplemental.isEnabled);
    assert.notOk(component.collapsed.specialAttireRequired.isEnabled);
    assert.notOk(component.collapsed.specialEquipmentRequired.isEnabled);
  });

  test('it renders expanded', async function (assert) {
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
      @manage={{(noop)}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
    />`);

    assert.notOk(component.collapsed.isVisible);
    assert.notOk(component.expanded.attributes.attendanceRequired.isEnabled);
    assert.ok(component.expanded.attributes.supplemental.isEnabled);
    assert.notOk(component.expanded.attributes.specialAttireRequired.isEnabled);
    assert.notOk(component.expanded.attributes.specialEquipmentRequired.isEnabled);
  });

  test('clicking expand fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('expand', () => {
      assert.ok(true, 'expand triggered.');
    });
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @manage={{(noop)}}
      @collapse={{(noop)}}
      @expand={{this.expand}}
    />`);

    await component.collapsed.expand();
  });

  test('clicking collapse fires action', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('collapse', () => {
      assert.ok(true, 'collapse triggered');
    });
    await render(hbs`<SchoolSessionAttributes
      @school={{this.school}}
      @details={{true}}
      @manage={{(noop)}}
      @collapse={{this.collapse}}
      @expand={{(noop)}}
    />`);

    await component.expanded.collapse();
  });
});
