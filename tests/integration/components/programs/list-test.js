import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import Service from '@ember/service';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/programs/list';

module('Integration | Component | programs/list', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.permissionCheckerMock = class extends Service {
      async canDeleteProgram() {
        return true;
      }
    };
    this.owner.register('service:permissionChecker', this.permissionCheckerMock);
  });

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('program', 3, { school });
    const programModels = await this.owner.lookup('service:store').findAll('program');
    this.set('programs', programModels);
    await render(hbs`<Programs::List @programs={{this.programs}} />`);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'program 0');
    assert.strictEqual(component.items[0].school, 'school 0');
    assert.strictEqual(component.items[1].title, 'program 1');
    assert.strictEqual(component.items[1].school, 'school 0');
    assert.strictEqual(component.items[2].title, 'program 2');
    assert.strictEqual(component.items[2].school, 'school 0');
  });

  test('it renders empty', async function (assert) {
    await render(hbs`<Programs::List @programs={{(array)}} />`);
    assert.strictEqual(component.items.length, 0);
    assert.ok(component.isEmpty);
  });

  test('remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('program', 3, { school });
    const programModels = await this.owner.lookup('service:store').findAll('program');
    this.set('programs', programModels);
    await render(hbs`<Programs::List @programs={{this.programs}} />`);
    assert.strictEqual(this.server.db.programs.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'program 0');
    await component.items[0].remove();
    await component.items[0].confirmRemoval.confirm();
    assert.strictEqual(this.server.db.programs.length, 2);
    assert.strictEqual(component.items.length, 2);
  });

  test('cancel remove', async function (assert) {
    const school = this.server.create('school');
    this.server.createList('program', 3, { school });
    const programModels = await this.owner.lookup('service:store').findAll('program');
    this.set('programs', programModels);
    await render(hbs`<Programs::List @programs={{this.programs}} />`);
    assert.strictEqual(this.server.db.programs.length, 3);
    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'program 0');
    await component.items[0].remove();
    await component.items[0].confirmRemoval.cancel();
    assert.strictEqual(this.server.db.programs.length, 3);
    assert.strictEqual(component.items.length, 3);
  });
});
