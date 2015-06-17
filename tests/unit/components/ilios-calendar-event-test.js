/* global moment */
import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('ilios-calendar-event', 'Unit | Component | ilios calendar event', {
  // Specify the other units that are required for this test
  // needs: ['component:foo', 'helper:bar'],
  unit: true
});

//re-enable when https://github.com/ef4/liquid-fire/issues/189 is resolved
// test('it renders', function(assert) {
//   assert.expect(2);
//
//   // Creates the component instance
//   var component = this.subject();
//   assert.equal(component._state, 'preRender');
//
//   component.set('event', {
//     name: 'test event',
//     startDate: moment().format(),
//     endDate: moment().format()
//   });
//   // Renders the component to the page
//   this.render();
//   assert.equal(component._state, 'inDOM');
// });
