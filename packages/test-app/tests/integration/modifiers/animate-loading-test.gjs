import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, waitUntil } from '@ember/test-helpers';
import animateLoading from 'ilios-common/modifiers/animate-loading';

module('Integration | Modifier | animate-loading', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders defaults', async function (assert) {
    await render(
      <template>
        <div {{animateLoading}}></div>
      </template>,
    );
    assert.ok(
      Math.abs(getComputedStyle(this.element.querySelector('div'), null).opacity - 0.1) < 0.001,
    );

    await waitUntil(
      () => getComputedStyle(this.element.querySelector('div'), null).opacity === '1',
      { timeout: 5000 },
    );
    assert.dom('div').hasStyle({
      opacity: '1',
      // transition: 'opacity 1s linear 0s', //temporarily disabled as FF ESR 91 doesn't support getting this value
    });
  });

  test('it renders options', async function (assert) {
    await render(
      <template>
        <div {{animateLoading initialOpacity=".3" finalOpacity="0.6" loadingTime=500}}>
        </div>
      </template>,
    );
    assert.ok(
      Math.abs(getComputedStyle(this.element.querySelector('div'), null).opacity - 0.3) < 0.001,
    );

    await waitUntil(
      () => getComputedStyle(this.element.querySelector('div'), null).opacity >= 0.6,
      { timeout: 5000 },
    );
    // assert.dom('div').hasStyle({
    //   transition: 'opacity 0.5s linear 0s', //temporarily disabled as FF ESR 91 doesn't support getting this value
    // });
    assert.ok(
      Math.abs(getComputedStyle(this.element.querySelector('div'), null).opacity - 0.6) < 0.001,
    );
  });

  test('it works with tracker service', async function (assert) {
    const tracker = this.owner.lookup('service:loading-opacity-tracker');
    tracker.set('someKey', '0.23');
    await render(
      <template>
        <div {{animateLoading "someKey"}}>
        </div>
      </template>,
    );
    assert.ok(
      Math.abs(getComputedStyle(this.element.querySelector('div'), null).opacity - 0.23) < 0.001,
    );

    await waitUntil(
      () => getComputedStyle(this.element.querySelector('div'), null).opacity === '1',
      { timeout: 5000 },
    );
    // assert.dom('div').hasStyle({
    //   opacity: '1',
    //   transition: 'opacity 1s linear 0s', //temporarily disabled as FF ESR 91 doesn't support getting this value
    // });
    await render(
      <template>
        <div></div>
      </template>,
    );
    assert.strictEqual(tracker.get('someKey'), '1');
  });
});
