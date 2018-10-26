import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent('file-upload', 'Unit | Component | file upload ', {
  needs: [
    'service:session',
    'service:iliosConfig',
    'service:concurrent-axe',
    'service:intl', // required
    `cldr:en`, // required (or language(s) of the locale(s) you plan to test against)
    `translation:en-us`, // required (or language(s) of the locale(s) you plan to test against)
    'util:intl/missing-message', // required
    'helper:t',
  ],
  unit: true
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
