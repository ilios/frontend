import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

const {RSVP} = Ember;

moduleForComponent('publish-all-sessions', 'Integration | Component | publish all sessions' + testgroup, {
  integration: true,

  beforeEach() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let sessions = [];
  this.set('sessions', RSVP.resolve(sessions));

  this.render(hbs`{{publish-all-sessions sessions=sessions}}`);
  
  assert.ok(this.$().text().search(/Sessions Incomplete: cannot publish \(0\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Complete: ready to publish \(0\)/) !== -1);
  assert.ok(this.$().text().search(/Sessions Requiring Review \(0\)/) !== -1);
  assert.ok(this.$().text().search(/Publish 0, schedule 0, and ignore 0 sessions/) !== -1);

});
