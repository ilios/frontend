import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-session-attributes';
import SchoolSessionAttributes from 'frontend/components/school-session-attributes';
import noop from 'ilios-common/helpers/noop';

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
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <SchoolSessionAttributes
          @school={{this.school}}
          @manage={{(noop)}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
        />
      </template>,
    );

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
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    await render(
      <template>
        <SchoolSessionAttributes
          @school={{this.school}}
          @details={{true}}
          @manage={{(noop)}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
        />
      </template>,
    );

    assert.notOk(component.collapsed.isVisible);
    assert.notOk(component.expanded.attributes.attendanceRequired.isEnabled);
    assert.ok(component.expanded.attributes.supplemental.isEnabled);
    assert.notOk(component.expanded.attributes.specialAttireRequired.isEnabled);
    assert.notOk(component.expanded.attributes.specialEquipmentRequired.isEnabled);
  });

  test('clicking expand fires action', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('expand', () => {
      assert.step('expand called');
    });
    await render(
      <template>
        <SchoolSessionAttributes
          @school={{this.school}}
          @manage={{(noop)}}
          @collapse={{(noop)}}
          @expand={{this.expand}}
        />
      </template>,
    );

    await component.collapsed.expand();
    assert.verifySteps(['expand called']);
  });

  test('clicking collapse fires action', async function (assert) {
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);
    this.set('school', schoolModel);
    this.set('collapse', () => {
      assert.step('collapse called');
    });
    await render(
      <template>
        <SchoolSessionAttributes
          @school={{this.school}}
          @details={{true}}
          @manage={{(noop)}}
          @collapse={{this.collapse}}
          @expand={{(noop)}}
        />
      </template>,
    );

    await component.expanded.collapse();
    assert.verifySteps(['collapse called']);
  });
});
