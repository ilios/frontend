import {
  moduleFor,
  test
} from 'ember-qunit';

moduleFor('controller:coursesyear/index', 'CoursesyearIndexController', {
  // Specify the other units that are required for this test.
  needs: ['controller:coursesschool', 'controller:coursesyear']
});

// Replace this with your real tests.
test('it exists', function() {
  var controller = this.subject();
  ok(controller);
});
