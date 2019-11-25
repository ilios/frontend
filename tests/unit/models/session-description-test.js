import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | SessionDescription', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('session-description');
    assert.ok(!!model);
  });

  test('text description', function(assert) {
    const model = this.owner.lookup('service:store').createRecord('session-description', {
      description: '<p>This is a <a href="http://localhost">test</a>.</p>'
    });
    assert.equal('This is a test.', model.get('textDescription'));
  });
});
