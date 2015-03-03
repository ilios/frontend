import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('session-objective-manager', {
  needs: ['helper:liquid-if', 'view:liquid-if']
});

//re-enable when https://github.com/ef4/liquid-fire/issues/189 is resolved
// test('it renders', function(assert) {
//   assert.expect(2);
//
//   // creates the component instance
//   var component = this.subject();
//   assert.equal(component._state, 'preRender');
//
//   // renders the component to the page
//   this.render();
//   assert.equal(component._state, 'inDOM');
// });
