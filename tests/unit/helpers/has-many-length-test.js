import { hasManyLength } from 'ilios-common/helpers/has-many-length';
import { module, test } from 'qunit';

module('Unit | Helper | has many length', function() {
  test('it works', function(assert) {
    const model = {
      hasMany(what){
        assert.equal(what, 'bar');
        return {
          ids(){
            return [1];
          }
        };
      }
    };
    const result = hasManyLength([model, 'bar']);
    assert.equal(result, 1);
  });

  test('returns model hasMany method is missing', function(assert) {
    const model = {
    };
    const result = hasManyLength([model, 'bar']);
    assert.equal(result, model);
  });

  test('returns model when ids method is missing', function(assert) {
    const model = {
      hasMany(what){
        assert.equal(what, 'bar');
        return {};
      }
    };
    const result = hasManyLength([model, 'bar']);
    assert.equal(result, model);
  });

  test('returns model when model is null', function(assert) {
    const model = null;
    const result = hasManyLength([model, 'bar']);
    assert.equal(result, model);
  });
});
