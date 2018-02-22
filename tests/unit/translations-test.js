import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import '@ember/test-helpers';
import { default as en } from 'ilios/locales/en/translations';
import { default as es } from 'ilios/locales/es/translations';
import { default as fr } from 'ilios/locales/fr/translations';

module('Unit | Translations', function(hooks) {
  setupRenderingTest(hooks);

  var getKeysFromObj = function(obj){
    let keys = {};
    Object.keys(obj).forEach(key => {
      let val = obj[key];
      if(typeof val === 'object'){
        keys[key] = getKeysFromObj(val);
      } else {
        keys[key] = true;
      }
    });
    
    return keys;
  };

  test('translations contain same keys', function(assert) {
    let enString = JSON.stringify(getKeysFromObj(en));
    let esString = JSON.stringify(getKeysFromObj(es));
    let frString = JSON.stringify(getKeysFromObj(fr));
    
    assert.equal(enString, esString, 'EN and ES have different keys');
    assert.equal(enString, frString, 'EN and FR have different keys');
  });
});