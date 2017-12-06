import {
  moduleForModel,
  test
} from 'ember-qunit';
import modelList from '../../helpers/model-list';
import { initialize } from '../../../initializers/replace-promise';

initialize();
moduleForModel('session-description', 'Unit | Model | SessionDescription', {
  needs: modelList
});

test('it exists', function(assert) {
  let model = this.subject();
  // let store = this.store();
  assert.ok(!!model);
});

test('text description', function(assert) {
  let model = this.subject({
    description: '<p>This is a <a href="http://localhost">test</a>.</p>'
  });
  assert.equal('This is a test.', model.get('textDescription'));
});
