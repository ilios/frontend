import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | user made reminder', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('user-made-reminder'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
