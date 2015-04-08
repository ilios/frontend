import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('session-details', {
  // specify the other units that are required for this test
  needs: [
    'component:course-header',
    'component:course-overview',
    'component:session-overview',
    'component:detail-objectives',
    'component:detail-learning-materials',
    'component:detail-topics',
    'component:detail-mesh',
    'component:session-offerings',
    'component:action-menu',
  ]
});

test('it renders', function(assert) {
  assert.expect(1);

  // creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // // renders the component to the page
  // this.render();
  // assert.equal(component._state, 'inDOM');
});
