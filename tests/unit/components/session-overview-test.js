import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('session-overview', {
  // specify the other units that are required for this test
  needs: [
    'component:editable-text',
    'component:editable-select',
    'component:editable-boolean',
    'component:editable-textarea',
    'component:publication-status',
    'component:action-menu',
    'helper:fa-icon',
    'component:wave-loader',
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
