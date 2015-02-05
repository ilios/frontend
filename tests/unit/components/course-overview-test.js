import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
import { initialize } from 'ilios/initializers/ember-moment';

moduleForComponent('course-overview', 'CourseOverviewComponent', {
  setup: function (container) {
      Ember.run(function () {
          // these two arguments are not used
          // but probably still good to pass them in
          // in the event we leverage them in the future
          initialize(container);
      });
  },
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
