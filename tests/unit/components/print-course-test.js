import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('print-course', {
  // specify the other units that are required for this test
  needs: [
    'component:course-overview',
    'component:detail-topics',
    'component:detail-mesh',
    'component:detail-learning-materials',
    'component:detail-objectives',
    'component:detail-competencies',
    'component:publication-status',
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
