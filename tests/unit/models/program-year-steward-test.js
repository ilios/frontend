import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | program-year-steward', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('program-year-steward'));
    // let store = this.store();
    assert.ok(!!model);
  });
});
