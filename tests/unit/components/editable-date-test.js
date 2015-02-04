import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';
import { initialize } from 'ilios/initializers/ember-moment';

moduleForComponent('editable-date', 'EditableDateComponent', {
  //initialize the ember-moment helper
  setup: function (container) {
    Ember.run(function () {
      initialize(container);
    });
  }
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
