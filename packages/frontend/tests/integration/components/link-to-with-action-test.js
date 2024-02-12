import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | link-to-with-action', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    this.set('content', 'Link Text');
    await render(hbs`
      <LinkToWithAction @route="dashboard">
        {{this.content}}
      </LinkToWithAction>`);

    assert.strictEqual(this.element.textContent.trim(), 'Link Text');
    assert.strictEqual(this.element.querySelector('a').getAttribute('href'), '/dashboard');
    assert.notOk(this.element.querySelector('a').classList.contains('active'));
  });

  test('it renders active link', async function (assert) {
    class RouterMock extends Service {
      urlFor() {
        return '/here';
      }
      isActive() {
        return true;
      }
    }

    this.owner.register('service:router', RouterMock);
    this.set('content', 'More Link Text');
    await render(hbs`
      <LinkToWithAction @route="somewhere">
        {{this.content}}
      </LinkToWithAction>`);

    assert.strictEqual(this.element.textContent.trim(), 'More Link Text');
    assert.ok(this.element.querySelector('a').classList.contains('active'));
  });
});
