import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('instructorgroup-details', 'Unit | Component | instructorgroup details', {
  // Specify the other units that are required for this test
  needs: ['component:inplace-text', 'component:user-search'],
  unit: true,
  setup: function () {
    this.registry.register('service:-routing', Ember.Object.extend({
      availableRoutes: function() { return ['index']; },
      hasRoute: function(name) { return name === 'index'; },
      isActiveForRoute: function() { return true; },
      generateURL: function() { return "/"; }
    }));
  }
});

test('it renders', function(assert) {
  assert.expect(2);

  // Creates the component instance
  var component = this.subject();
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
