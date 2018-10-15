
import { hasManyLength } from 'ilios-common/helpers/has-many-length';
import { module, test } from 'qunit';

module('Unit | Helper | has many length');

test('it works', function(assert) {
  let model = {
    hasMany(what){
      assert.equal(what, 'bar');
      return {
        ids(){
          return [1];
        }
      };
    }
  };
  let result = hasManyLength([model, 'bar']);
  assert.equal(result, 1);
});

test('returns model hasMany method is missing', function(assert) {
  let model = {
  };
  let result = hasManyLength([model, 'bar']);
  assert.equal(result, model);
});

test('returns model when ids method is missing', function(assert) {
  let model = {
    hasMany(what){
      assert.equal(what, 'bar');
      return {};
    }
  };
  let result = hasManyLength([model, 'bar']);
  assert.equal(result, model);
});

test('returns model when model is null', function(assert) {
  let model = null;
  let result = hasManyLength([model, 'bar']);
  assert.equal(result, model);
});
