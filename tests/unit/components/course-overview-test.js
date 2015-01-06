import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('course-overview', 'CourseOverviewComponent', {
  // specify the other units that are required for this test
  needs: [
    'component:live-search',
    'component:editable-text',
    'component:editable-date',
    'component:editable-select',
    'component:pikaday-input',
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
