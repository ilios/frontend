import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('boolean-check', 'Unit | Component | boolean check ', {
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
