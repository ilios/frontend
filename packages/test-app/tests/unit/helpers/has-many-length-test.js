import { hasManyLength } from 'ilios-common/helpers/has-many-length';
import { module, test } from 'qunit';

module('Unit | Helper | has many length', function () {
  test('it works', function (assert) {
    const model = {
      hasMany(what) {
        assert.step('hasMany called');
        assert.strictEqual(what, 'bar');
        return {
          ids() {
            return [1];
          },
        };
      },
    };
    const result = hasManyLength([model, 'bar']);
    assert.strictEqual(result, 1);
    assert.verifySteps(['hasMany called']);
  });

  test('returns model hasMany method is missing', function (assert) {
    const model = {};
    const result = hasManyLength([model, 'bar']);
    assert.strictEqual(result, model);
  });

  test('returns model when ids method is missing', function (assert) {
    const model = {
      hasMany(what) {
        assert.step('hasMany called');
        assert.strictEqual(what, 'bar');
        return {};
      },
    };
    const result = hasManyLength([model, 'bar']);
    assert.strictEqual(result, model);
    assert.verifySteps(['hasMany called']);
  });

  test('returns model when model is null', function (assert) {
    const model = null;
    const result = hasManyLength([model, 'bar']);
    assert.strictEqual(result, model);
  });
});
