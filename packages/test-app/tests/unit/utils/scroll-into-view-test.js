import { settled } from '@ember/test-helpers';
import { module, test } from 'qunit';
import scrollIntoView from 'test-app/utils/scroll-into-view';

module('Unit | Utility | scroll into view', function () {
  test('defaults', async function (assert) {
    assert.expect(4);
    const mockElement = {
      scrollIntoView(options) {
        assert.strictEqual(Object.keys(options).length, 3);
        assert.strictEqual(options.block, 'start');
        assert.strictEqual(options.inline, 'nearest');
        assert.strictEqual(options.behavior, 'instant');
      },
    };
    scrollIntoView(mockElement);
    await settled();
  });

  test('overrides', async function (assert) {
    assert.expect(4);
    const mockElement = {
      scrollIntoView(options) {
        assert.strictEqual(Object.keys(options).length, 3);
        assert.strictEqual(options.behavior, 'smooth');
        assert.strictEqual(options.inline, 'nearest');
        assert.strictEqual(options.block, 'end');
      },
    };
    scrollIntoView(mockElement, { opts: { behavior: 'smooth', block: 'end' } });
    await settled();
  });

  test('disable scrolling', async function (assert) {
    assert.expect(0);
    const mockElement = {
      scrollIntoView() {
        assert.notOk(true);
      },
    };
    scrollIntoView(mockElement, { disabled: true });
    await settled();
  });
});
