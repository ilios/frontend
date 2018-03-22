import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';
import { singularize, pluralize } from 'ember-inflector';

import { run } from '@ember/runloop';

initialize();

module('Unit | Model | AamcPcrs', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let model = run(() => this.owner.lookup('service:store').createRecord('aamc-pcrs'));
    // let store = this.store();
    assert.ok(!!model);
  });

  test('pluralization', function(assert){
    assert.equal(pluralize('aamc-pcrs'), 'aamc-pcrs');
    assert.equal(singularize('aamc-pcrs'), 'aamc-pcrs');
  });
});
