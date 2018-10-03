import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('error-display', 'Unit | Component | error display ', {
  unit: true,
  needs: ['service:concurrent-axe'],
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const expected = {
    errors:     null,
    showDetails: true
  };

  const component = this.subject();

  const actual = {
    errors:     component.get('errors'),
    showDetails: component.get('showDetails'),
  };

  assert.deepEqual(actual, expected, 'default values are correct');
});

test('`toggleDetails` action changes `showDetails` property', function(assert) {
  assert.expect(1);

  const component = this.subject();

  component.send('toggleDetails');

  assert.equal(component.get('showDetails'), false);
});
