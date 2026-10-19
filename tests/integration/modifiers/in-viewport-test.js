import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, rerender } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Modifier | in-viewport', function (hooks) {
  setupRenderingTest(hooks);

  let callback;
  let originalIntersectionObserver;

  hooks.beforeEach(function () {
    originalIntersectionObserver = globalThis.IntersectionObserver;

    this.observer = class {
      constructor(cb) {
        callback = cb;
      }

      observe() {}
      disconnect() {}
    };

    globalThis.IntersectionObserver = this.observer;
  });

  hooks.afterEach(function () {
    globalThis.IntersectionObserver = originalIntersectionObserver;
  });

  test('calls onEnter and onExit', async function (assert) {
    this.onEnter = () => assert.step('enter');
    this.onExit = () => assert.step('exit');

    await render(hbs`
      <div
        {{in-viewport
          onEnter=this.onEnter
          onExit=this.onExit
        }}
      ></div>
    `);

    callback([{ isIntersecting: true }]);
    callback([{ isIntersecting: false }]);
    callback([{ isIntersecting: true }]);
    callback([{ isIntersecting: false }]);

    assert.verifySteps(['enter', 'exit', 'enter', 'exit']);
  });

  test('callbacks are optional', async function (assert) {
    await render(hbs`<div {{in-viewport}}></div>`);

    callback([{ isIntersecting: true }]);
    callback([{ isIntersecting: false }]);

    assert.ok(true, 'does not throw without callbacks');
  });

  test('continues working after rerender', async function (assert) {
    this.onEnter = () => assert.step('enter');
    this.onExit = () => assert.step('exit');

    await render(hbs`
      <div
        {{in-viewport
          onEnter=this.onEnter
          onExit=this.onExit
        }}
      ></div>
    `);

    callback([{ isIntersecting: true }]);

    await rerender();

    callback([{ isIntersecting: false }]);

    assert.verifySteps(['enter', 'exit']);
  });

  test('disconnects when the element is removed', async function (assert) {
    this.showElement = true;
    this.observer.prototype.disconnect = () => assert.step('disconnect');

    await render(hbs`
      {{#if this.showElement}}
        <div {{in-viewport}}></div>
      {{/if}}
    `);

    this.set('showElement', false);
    await rerender();

    assert.verifySteps(['disconnect']);
  });
});
