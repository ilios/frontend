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
    'component:ilios-course-details-cohorts',
    'component:ilios-details-objectives',
    'component:ilios-details-learning-materials',
    'component:detail-topics',
    'component:detail-mesh',
    'helper:fa-icon'
  ]
});

test('it renders', function() {
  expect(2);

  // creates the component instance
  var component = this.subject();
  equal(component._state, 'preRender');

  // appends the component to the page
  this.append();
  equal(component._state, 'inDOM');
});
