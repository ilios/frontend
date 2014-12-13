import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('course-header', 'CourseHeaderComponent', {
  // specify the other units that are required for this test
  needs: [
  'component:editable-text',
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
