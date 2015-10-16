import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('error-display', 'Unit | Component | error display', {
  unit: true
});

test('properties have default values', function(assert) {
  assert.expect(1);

  const expected = {
    content:     null,
    showDetails: false
  };

  const component = this.subject();

  const actual = {
    content:     component.get('content'),
    showDetails: component.get('showDetails'),
  };

  assert.deepEqual(actual, expected, 'default values are correct');
});

test('`toggleDetails` action changes `showDetails` property', function(assert) {
  assert.expect(1);

  const component = this.subject();

  component.send('toggleDetails');

  assert.equal(component.get('showDetails'), true);
});

test('`totalErrors` computed property works', function(assert) {
  assert.expect(2);

  const component = this.subject({
    content: [1]
  });

  assert.equal(component.get('totalErrors'), 'There is 1 error');

  component.get('content').pushObject(2);

  assert.equal(component.get('totalErrors'), 'There are 2 errors');
});

test('`revisedContent` computed property works', function(assert) {
  assert.expect(1);

  const component = this.subject({
    content: [{
      message: 'Adapter operation failed',
      stack: 'Error: Adapter operation failed...',
      errors: [{
        status: '403',
        title: 'The backend responded with an error'
      }]
    }]
  });

  const expected = [{
    mainMessage: 'Adapter operation failed',
    message: 'The backend responded with an error',
    stack: 'Error: Adapter operation failed...',
    statusCode: '403'
  }];

  assert.deepEqual(component.get('revisedContent'), expected, 'revisedContent works');
});
