import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('session-overview', {
  // specify the other units that are required for this test
  needs: [
    'component:inplace-text',
    'component:inplace-select',
    'component:inplace-boolean',
    'component:inplace-textarea',
    'component:publication-status',
    'component:action-menu',
    'helper:fa-icon',
    'component:pulse-loader',
    'component:boolean-check',
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
