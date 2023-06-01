import createTypedLearningMaterialProxy from 'dummy/utils/create-typed-learning-material-proxy';
import { module, test } from 'qunit';

module('Unit | Utility | create-typed-learning-material-proxy', function () {
  test('file type', function (assert) {
    const proxy = createTypedLearningMaterialProxy({ absoluteFileUri: '/dev/null' });
    assert.strictEqual(proxy.type, 'file');
  });
  test('citation type', function (assert) {
    const proxy = createTypedLearningMaterialProxy({ citation: 'Lorem Ipsum' });
    assert.strictEqual(proxy.type, 'citation');
  });
  test('link type', function (assert) {
    const proxy = createTypedLearningMaterialProxy({ link: 'https://iliosproject.org' });
    assert.strictEqual(proxy.type, 'link');
  });
  test('default type', function (assert) {
    const proxy = createTypedLearningMaterialProxy({});
    assert.strictEqual(proxy.type, 'file');
  });
  test('is blanked', function (assert) {
    const proxy = createTypedLearningMaterialProxy({ citation: 'Lorem Ipsum', isBlanked: true });
    assert.strictEqual(proxy.type, 'unknown');
  });
  test('some other attribute', function (assert) {
    const bar = 'barbaz';
    const proxy = createTypedLearningMaterialProxy({ foo: bar });
    assert.strictEqual(proxy.foo, bar);
  });
});
