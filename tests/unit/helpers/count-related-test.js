import { countRelated } from 'ilios/helpers/count-related';
import { module, test } from 'qunit';

module('Unit | Helper | count related', function() {
  test('calls has many on object', function(assert) {
    let object = {
      hasMany(what){
        assert.equal(what, 'stuff');

        return {
          ids(){
            return ['rhett', 'pat'];
          }
        };
      }
    };
    let result = countRelated([object, 'stuff']);
    assert.equal(result, 2);
  });

  test('missing what returns false', function(assert) {
    let object = {
      countRelated(){}
    };
    let result = countRelated([object, null]);
    assert.notOk(result);
  });

  test('missing object returns false', function(assert) {
    let result = countRelated([null, 'what']);
    assert.notOk(result);
  });

  test('object with no countRelated method returns false', function(assert) {
    let object = {};
    let result = countRelated([object, 'what']);
    assert.notOk(result);
  });
});
