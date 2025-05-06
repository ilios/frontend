import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import a11yAudit from 'ember-a11y-testing/test-support/audit';
import { component } from 'frontend/tests/pages/components/learner-group/new-single';
import NewSingle from 'frontend/components/learner-group/new-single';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learner-group/new-single', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders without fill mode', async function (assert) {
    await render(<template><NewSingle @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.ok(component.isVisible);
    assert.notOk(component.canFill);
    await a11yAudit(this.element);
  });

  test('it renders with fill mode false', async function (assert) {
    await render(
      <template>
        <NewSingle @save={{(noop)}} @cancel={{(noop)}} @fillModeSupported={{false}} />
      </template>,
    );
    assert.ok(component.isVisible);
    assert.notOk(component.canFill);
    await a11yAudit(this.element);
  });

  test('save', async function (assert) {
    assert.expect(2);
    this.set('save', (title, fill) => {
      assert.strictEqual(title, 'new group');
      assert.false(fill);
    });
    await render(
      <template>
        <NewSingle @save={{this.save}} @cancel={{(noop)}} @fillModeSupported={{true}} />
      </template>,
    );
    await component.title('new group');
    await component.save();
  });

  test('save filled', async function (assert) {
    assert.expect(3);
    this.set('save', (title, fill) => {
      assert.strictEqual(title, 'new group');
      assert.true(fill);
    });
    await render(
      <template>
        <NewSingle @save={{this.save}} @cancel={{(noop)}} @fillModeSupported={{true}} />
      </template>,
    );
    await component.title('new group');
    assert.ok(component.canFill);
    await component.fillWithCohort();
    await component.save();
  });

  test('validation fails if title is too short', async function (assert) {
    await render(<template><NewSingle @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.titleErrors.length, 0);
    await component.title('a');
    await component.save();
    assert.strictEqual(component.titleErrors.length, 1);
    assert.strictEqual(
      component.titleErrors[0].text,
      'Title is too short (minimum is 3 characters)',
    );
  });

  test('validation fails if title is too long', async function (assert) {
    await render(<template><NewSingle @save={{(noop)}} @cancel={{(noop)}} /></template>);
    assert.strictEqual(component.titleErrors.length, 0);
    await component.title('0123456789'.repeat(21));
    await component.save();
    assert.strictEqual(component.titleErrors.length, 1);
    assert.strictEqual(
      component.titleErrors[0].text,
      'Title is too long (maximum is 60 characters)',
    );
  });
});
