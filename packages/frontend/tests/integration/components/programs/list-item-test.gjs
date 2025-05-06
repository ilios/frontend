import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import Service from '@ember/service';
import { component } from 'frontend/tests/pages/components/programs/list-item';
import ListItem from 'frontend/components/programs/list-item';

module('Integration | Component | programs/list-item', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteProgram() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
    const school = this.server.create('school');
    this.program = this.server.create('program', { school });
  });

  test('it renders', async function (assert) {
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('program', programModel);
    await render(<template><ListItem @program={{this.program}} /></template>);
    assert.strictEqual(component.title, 'program 0');
    assert.strictEqual(component.school, 'school 0');
    assert.ok(component.canBeRemoved);
  });

  test('no permission to delete', async function (assert) {
    this.permissionCheckerMock.reopen({
      canDeleteProgram() {
        return false;
      },
    });
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('program', programModel);
    await render(<template><ListItem @program={{this.program}} /></template>);
    assert.strictEqual(component.title, 'program 0');
    assert.notOk(component.canBeRemoved);
  });

  test('can not delete with associated years', async function (assert) {
    this.server.create('program-year', { program: this.program });
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('program', programModel);
    await render(<template><ListItem @program={{this.program}} /></template>);
    assert.strictEqual(component.title, 'program 0');
    assert.notOk(component.canBeRemoved);
  });

  test('can not delete with associated ci reports', async function (assert) {
    this.server.create('curriculum-inventory-report', { program: this.program });
    const programModel = await this.owner
      .lookup('service:store')
      .findRecord('program', this.program.id);
    this.set('program', programModel);
    await render(<template><ListItem @program={{this.program}} /></template>);
    assert.strictEqual(component.title, 'program 0');
    assert.notOk(component.canBeRemoved);
  });
});
