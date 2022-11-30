import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios/tests/pages/components/program/new';

module('Integration | Component | program/new', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    await render(hbs`<Program::New @save={{(noop)}} @cancel={{(noop)}} />
`);
    assert.strictEqual(component.title.label, 'Title:');
    assert.strictEqual(component.done.text, 'Done');
    assert.strictEqual(component.cancel.text, 'Cancel');
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    this.set('cancel', () => {
      assert.ok(true, 'cancel fired.');
    });
    await render(hbs`<Program::New @save={{(noop)}} @cancel={{this.cancel}} />
`);
    await component.cancel.click();
  });

  test('validation fails, no title', async function (assert) {
    assert.expect(3);

    await render(hbs`<Program::New @save={{(noop)}} @cancel={{(noop)}} />
`);
    assert.strictEqual(component.title.errors.length, 0);
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(component.title.errors[0].text, 'This field can not be blank');
  });

  test('validation fails, title too short', async function (assert) {
    assert.expect(3);

    await render(hbs`<Program::New @save={{(noop)}} @cancel={{(noop)}} />
`);
    assert.strictEqual(component.title.errors.length, 0);
    await component.title.set('Aa');
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(
      component.title.errors[0].text,
      'This field is too short (minimum is 3 characters)'
    );
  });

  test('validation fails, title too long', async function (assert) {
    assert.expect(3);

    await render(hbs`<Program::New @save={{(noop)}} @cancel={{(noop)}} />
`);
    assert.strictEqual(component.title.errors.length, 0);
    await component.title.set('0123456789'.repeat(21));
    await component.done.click();
    assert.strictEqual(component.title.errors.length, 1);
    assert.strictEqual(
      component.title.errors[0].text,
      'This field is too long (maximum is 200 characters)'
    );
  });

  test('save', async function (assert) {
    assert.expect(1);
    this.set('save', async (program) => {
      assert.strictEqual(program.title, 'Jayden Rules!');
    });

    await render(hbs`<Program::New @save={{this.save}} @cancel={{(noop)}} />
`);
    await component.title.set('Jayden Rules!');
    await component.done.click();
  });
});
