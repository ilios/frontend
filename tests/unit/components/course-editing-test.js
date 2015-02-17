import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('course-editing', 'CourseEditingComponent', {
  // specify the other units that are required for this test
  needs: [
    'component:course-header',
    'component:course-overview',
    'component:ilios-sessions-list',
    'component:detail-topics',
    'component:detail-mesh',
    'component:detail-cohorts',
    'component:detail-learning-materials',
    'component:detail-objectives',
    'component:detail-competencies',
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
