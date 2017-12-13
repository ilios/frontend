import { run } from '@ember/runloop';
import { moduleForModel, test } from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';
import { pluralize } from 'ember-inflector';

initialize();
moduleForModel('vocabulary', 'Unit | Model | vocabulary', {
  // Specify the other units that are required for this test.
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('pluralization', function(assert){
  assert.equal(pluralize('vocabulary'), 'vocabularies');
});

test('getTopLevelTerms', async function(assert) {
  assert.expect(3);
  const model = this.subject();
  const store = model.store;
  run(async () => {
    const term1 = store.createRecord('term', { id: 1 });
    const term2 = store.createRecord('term', { id: 2 });
    const term3 = store.createRecord('term', { id: 3, parent: term2 });
    model.get('terms').pushObjects([ term1, term2, term3 ]);
    const topLevelTerms = await model.get('topLevelTerms');
    assert.equal(2, topLevelTerms.length);
    assert.ok(topLevelTerms.includes(term1));
    assert.ok(topLevelTerms.includes(term2));
  });
});
