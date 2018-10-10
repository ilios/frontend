import { run } from '@ember/runloop';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('expand-collapse-button', 'Unit | Component | expand collapse button ', {
  unit: true,
  needs: ['service:concurrent-axe'],
});

test('has default false value', function(assert) {
  assert.expect(1);

  run(this, () => {
    const component = this.subject();

    assert.equal(component.get('value'), false, 'value is false by default');
  });
});
