import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('detail-learnergroups', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('it renders', function(assert) {
  assert.expect(1);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // // Renders the component to the page
  // this.render();
  // assert.equal(component._state, 'inDOM');
});
