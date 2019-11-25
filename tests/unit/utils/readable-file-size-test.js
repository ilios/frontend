import readableFileSize from 'dummy/utils/readable-file-size';
import { module, test } from 'qunit';

module('Unit | Utility | readable file size', function() {
  test('test 0', function(assert) {
    const result = readableFileSize(0);
    assert.equal(result, '0 b');
  });

  test('test B', function(assert) {
    const result = readableFileSize(100);
    assert.equal(result, '100 b');
  });

  test('test kB', function(assert) {
    const result = readableFileSize(1024);
    assert.equal(result, '1 kB');
  });

  test('test MB', function(assert) {
    const result = readableFileSize(1124000);
    assert.equal(result, '1 MB');
  });

  test('test GB', function(assert) {
    const result = readableFileSize(1124000000);
    assert.equal(result, '1 GB');
  });
});
