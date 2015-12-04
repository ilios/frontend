import { moduleForComponent, test } from 'ember-qunit';
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

const { run } = Ember;

moduleForComponent('expand-collapse-button', 'Unit | Component | expand collapse button ' + testgroup, {
  unit: true
});

test('has default false value', function(assert) {
  assert.expect(1);

  run(this, () => {
    const component = this.subject();

    assert.equal(component.get('value'), false, 'value is false by default');
  });
});
