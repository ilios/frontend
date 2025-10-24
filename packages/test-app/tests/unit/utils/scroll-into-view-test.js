import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import scrollIntoView from 'test-app/utils/scroll-into-view';

module('Unit | Utility | scroll into view', function () {
  test('defaults', async function (assert) {
    const mockElement = {
      scrollIntoView(options) {
        assert.step('scrollIntoView called');
        assert.strictEqual(Object.keys(options).length, 3);
        assert.strictEqual(options.block, 'start');
        assert.strictEqual(options.inline, 'nearest');
        assert.strictEqual(options.behavior, 'instant');
      },
    };
    scrollIntoView(mockElement);
    await settled();
    assert.verifySteps(['scrollIntoView called']);
  });

  test('overrides', async function (assert) {
    const mockElement = {
      scrollIntoView(options) {
        assert.step('scrollIntoView called');
        assert.strictEqual(Object.keys(options).length, 3);
        assert.strictEqual(options.behavior, 'smooth');
        assert.strictEqual(options.inline, 'nearest');
        assert.strictEqual(options.block, 'end');
      },
    };
    scrollIntoView(mockElement, { opts: { behavior: 'smooth', block: 'end' } });
    await settled();
    assert.verifySteps(['scrollIntoView called']);
  });

  test('disable scrolling', async function (assert) {
    const mockElement = {
      scrollIntoView() {
        assert.step('scrollIntoView called');
      },
    };
    scrollIntoView(mockElement, { disabled: true });
    await settled();
    assert.verifySteps([]);
  });
});
