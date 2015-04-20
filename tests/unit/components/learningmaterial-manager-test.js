import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('learningmaterial-manager', {
  // specify the other units that are required for this test
  needs: [
    'component:mesh-manager',
    'component:search-box',
    'component:inplace-boolean',
    'component:inplace-textarea',
    'component:inplace-select'
  ]
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
