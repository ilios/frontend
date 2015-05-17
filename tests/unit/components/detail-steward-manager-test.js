import {
  moduleForComponent,
  test
} from 'ember-qunit';
import Ember from 'ember';

moduleForComponent('detail-steward-manager', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar']
});

test('it renders', function(assert) {
  assert.expect(2);

  var store = {
    find(){
      return Ember.RSVP.Promise.resolve([]);
    }
  };
  // Creates the component instance
  var component = this.subject();
  component.set('store', store);
  assert.equal(component._state, 'preRender');

  // Renders the component to the page
  this.render();
  assert.equal(component._state, 'inDOM');
});
