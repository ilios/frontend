import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import { component } from 'ilios-common/page-objects/components/new-session';
import NewSession from 'ilios-common/components/new-session';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | new session', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const sessionType = this.server.create('session-type');
    const sessionType2 = this.server.create('session-type');
    this.sessionType = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType.id);
    this.sessionType2 = await this.owner
      .lookup('service:store')
      .findRecord('session-type', sessionType2.id);
  });

  test('it renders', async function (assert) {
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    await render(
      <template>
        <NewSession @save={{(noop)}} @cancel={{(noop)}} @sessionTypes={{this.sessionTypes}} />
      </template>,
    );
    assert.strictEqual(component.sessionTypes.length, 2);
    assert.strictEqual(component.sessionTypes[0].title, 'session type 0');
    assert.strictEqual(component.sessionTypes[1].title, 'session type 1');
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <NewSession @save={{(noop)}} @cancel={{this.cancel}} @sessionTypes={{(array)}} />
      </template>,
    );
    await component.cancel();
  });

  test('save', async function (assert) {
    assert.expect(2);
    const newTitle = 'foobar';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', (session) => {
      assert.strictEqual(session.get('title'), newTitle);
      assert.strictEqual(session.get('sessionType').get('title'), this.sessionType2.title);
    });
    await render(
      <template>
        <NewSession @save={{this.save}} @cancel={{(noop)}} @sessionTypes={{this.sessionTypes}} />
      </template>,
    );
    await component.selectSessionType(2);
    await component.title.set(newTitle);
    await component.save();
  });

  test('save on pressing enter in title field', async function (assert) {
    assert.expect(2);
    const newTitle = 'foobar';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', (session) => {
      assert.strictEqual(session.get('title'), newTitle);
      assert.strictEqual(session.get('sessionType').get('title'), this.sessionType2.title);
    });
    await render(
      <template>
        <NewSession @save={{this.save}} @cancel={{(noop)}} @sessionTypes={{this.sessionTypes}} />
      </template>,
    );
    await component.selectSessionType(2);
    await component.title.set(newTitle);
    await component.title.submit();
  });

  test('input validation fails if title is too short', async function (assert) {
    assert.expect(4);
    const newTitle = 'fo';
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', () => {
      assert.ok(false);
    });
    await render(
      <template>
        <NewSession @save={{this.save}} @cancel={{(noop)}} @sessionTypes={{this.sessionTypes}} />
      </template>,
    );
    assert.notOk(component.hasError);
    assert.notOk(component.title.hasError);
    await component.title.set(newTitle);
    await component.title.submit();
    assert.ok(component.hasError);
    assert.ok(component.title.hasError);
  });

  test('input validation fails if title is too long', async function (assert) {
    assert.expect(4);
    const newTitle = '0123456789'.repeat(21);
    this.set('sessionTypes', [this.sessionType, this.sessionType2]);
    this.set('save', () => {
      assert.ok(false);
    });
    await render(
      <template>
        <NewSession @save={{this.save}} @cancel={{(noop)}} @sessionTypes={{this.sessionTypes}} />
      </template>,
    );
    assert.notOk(component.hasError);
    assert.notOk(component.title.hasError);
    await component.title.set(newTitle);
    await component.title.submit();
    assert.ok(component.hasError);
    assert.ok(component.title.hasError);
  });
});
