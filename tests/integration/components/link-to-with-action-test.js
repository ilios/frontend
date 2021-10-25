import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import Service from '@ember/service';

module('Integration | Component | link-to-with-action', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(7);
    class RouterMock extends Service {
      urlFor(route, obj) {
        assert.equal(route, 'somewhere');
        assert.ok('queryParams' in obj);
        assert.deepEqual(obj.queryParams, {});
        return '/here/somewhere';
      }
      isActive(route) {
        assert.equal(route, 'somewhere');
        return false;
      }
    }
    this.owner.register('service:router', RouterMock);

    await render(hbs`
      <LinkToWithAction @route="somewhere">
        Link Text
      </LinkToWithAction>
    `);

    assert.equal(this.element.textContent.trim(), 'Link Text');
    assert.equal(this.element.querySelector('a').getAttribute('href'), '/here/somewhere');
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

    await render(hbs`
      <LinkToWithAction @route="somewhere">
        More Link Text
      </LinkToWithAction>
    `);

    assert.equal(this.element.textContent.trim(), 'More Link Text');
    assert.ok(this.element.querySelector('a').classList.contains('active'));
  });
});
