import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | boolean check ', function(hooks) {
  setupTest(hooks);

  test('default properties are correct', function(assert) {
    assert.expect(2);

    const component = this.owner.factoryFor('component:boolean-check').create();

    const tagName = component.get('tagName');
    const value = component.get('value');

    assert.equal(tagName, 'span', 'span contains input helper');
    assert.equal(value, false, 'checkbox is unchecked by default');
  });
});