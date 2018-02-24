import readableFileSize from 'ilios/utils/readable-file-size';
import { module, test } from 'qunit';

module('Unit | Utility | readable file size', function() {
  test('test 0', function(assert) {
    let result = readableFileSize(0);
    assert.equal(result, '0 b');
  });

  test('test B', function(assert) {
    let result = readableFileSize(100);
    assert.equal(result, '100 b');
  });

  test('test kB', function(assert) {
    let result = readableFileSize(1024);
    assert.equal(result, '1 kB');
  });

  test('test MB', function(assert) {
    let result = readableFileSize(1124000);
    assert.equal(result, '1 MB');
  });

  test('test GB', function(assert) {
    let result = readableFileSize(1124000000);
    assert.equal(result, '1 GB');
  });
});