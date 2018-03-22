import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | SessionDescription', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('session-description'));
    // let store = this.store();
    assert.ok(!!model);
  });

  test('text description', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('session-description', {
      description: '<p>This is a <a href="http://localhost">test</a>.</p>'
    }));
    assert.equal('This is a test.', model.get('textDescription'));
  });
});
