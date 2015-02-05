import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
import { initialize } from 'ilios/initializers/ember-moment';

moduleForComponent('ilios-course-list-item', 'IliosCourseListItemComponent', {
  setup: function (container) {
      Ember.run(function () {
          // these two arguments are not used
          // but probably still good to pass them in
          // in the event we leverage them in the future
          initialize(container);
      });
  },
  // specify the other units that are required for this test
  needs: ['component:action-menu']
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
