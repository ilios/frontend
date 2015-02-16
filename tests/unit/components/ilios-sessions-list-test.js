import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ilios-sessions-list', 'IliosSessionsListComponent', {
  needs: [
    'component:publication-status',
    'helper:fa-icon'
  ]
});

test('it renders', function(assert) {
  assert.expect(2);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  assert.equal(component._state, 'inDOM');
});
