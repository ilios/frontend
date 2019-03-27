import { truncateText } from 'ilios-common/helpers/truncate-text';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Helper | truncate-text', function(hooks) {
  setupTest(hooks);

  test('it truncates text', function(assert) {
    assert.expect(2);

    let result = truncateText(['This is a title'], { max: 5 });
    assert.equal(result, 'This...');
    result = truncateText(['Apple'], { max: 5 });
    assert.equal(result, 'Apple');
  });
});
