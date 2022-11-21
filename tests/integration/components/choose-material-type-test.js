import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { component } from 'ilios-common/page-objects/components/choose-material-type';
import { a11yAudit } from 'ember-a11y-testing/test-support';

module('Integration | Component | choose-material-type', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders and is accessible', async function (assert) {
    this.set('nothing', () => {});
    await render(hbs`<ChooseMaterialType
      @choose={{action this.nothing}}
      @types={{array "file" "link" "citation"}}
    />
`);

    await a11yAudit(this.element);
    assert.strictEqual(component.text, 'Add');

    await component.toggle.click();
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('click opens menu', async function (assert) {
    this.set('nothing', () => {});
    await render(hbs`<ChooseMaterialType
      @choose={{action this.nothing}}
      @types={{array "file" "link" "citation"}}
    />
`);

    assert.strictEqual(component.types.length, 0);
    await component.toggle.click();
    assert.strictEqual(component.types.length, 3);
    assert.strictEqual(component.types[0].text, 'File');
    assert.strictEqual(component.types[1].text, 'Web Link');
    assert.strictEqual(component.types[2].text, 'Citation');
  });

  test('clicking type fires action', async function (assert) {
    assert.expect(1);
    this.set('choose', (type) => {
      assert.strictEqual(type, 'link');
    });
    await render(hbs`<ChooseMaterialType
      @choose={{action this.choose}}
      @types={{array "file" "link" "citation"}}
    />
`);
    await component.toggle.click();
    await component.types[1].click();
  });

  test('down opens menu', async function (assert) {
    this.set('nothing', () => {});
    await render(hbs`<ChooseMaterialType
      @choose={{action this.nothing}}
      @types={{array "file" "link" "citation"}}
    />
`);

    assert.strictEqual(component.types.length, 0);
    await component.toggle.down();
    assert.strictEqual(component.types.length, 3);
  });

  test('escape closes menu', async function (assert) {
    this.set('nothing', () => {});
    await render(hbs`<ChooseMaterialType
      @choose={{action this.nothing}}
      @types={{array "file" "link" "citation"}}
    />
`);

    await component.toggle.down();
    assert.strictEqual(component.types.length, 3);
    await component.toggle.esc();
    assert.strictEqual(component.types.length, 0);
  });
});
