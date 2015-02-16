import {
  moduleForComponent,
  test
} from 'ember-qunit';

moduleForComponent('ilios-course-details', 'IliosCourseDetailsComponent', {
  // specify the other units that are required for this test
  needs: [
    'component:course-header',
    'component:ilios-sessions-list',
    'component:course-overview'
  ]
});

//disabled because of some kind of cyclical issue with momentjs
// test('it renders', function(assert) {
//   assert.expect(2);
//
//   // creates the component instance
//   var component = this.subject();
//   assert.equal(component._state, 'preRender');
//
//   // appends the component to the page
//   this.append();
//   assert.equal(component._state, 'inDOM');
// });
