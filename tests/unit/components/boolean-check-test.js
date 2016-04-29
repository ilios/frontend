import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForComponent('boolean-check', 'Unit | Component | boolean check ' + testgroup, {
  unit: true
});

test('default properties are correct', function(assert) {
  assert.expect(2);

  const component = this.subject();

  const tagName = component.get('tagName');
  const value = component.get('value');

  assert.equal(tagName, 'span', 'span contains input helper');
  assert.equal(value, false, 'checkbox is unchecked by default');
});
