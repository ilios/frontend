import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { singularize, pluralize } from 'ember-inflector';

module('Unit | Model | AamcPcrs', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = this.owner.lookup('service:store').createRecord('aamc-pcrs');
    assert.ok(!!model);
  });

  test('pluralization', function(assert){
    assert.equal(pluralize('aamc-pcrs'), 'aamc-pcrs');
    assert.equal(singularize('aamc-pcrs'), 'aamc-pcrs');
  });
});
