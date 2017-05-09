import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { singularize, pluralize } from 'ember-inflector';

moduleForModel('aamc-pcrs', 'Unit | Model | AamcPcrs', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('pluralization', function(assert){
  assert.equal(pluralize('aamc-pcrs'), 'aamc-pcrs');
  assert.equal(singularize('aamc-pcrs'), 'aamc-pcrs');
});
