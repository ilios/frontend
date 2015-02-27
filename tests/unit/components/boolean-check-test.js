import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('boolean-check', {
  // specify the other units that are required for this test
  needs: ['helper:fa-icon']
});

test('it renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
