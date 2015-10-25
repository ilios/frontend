import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
import {a as testgroup} from 'ilios/tests/helpers/test-groups';

moduleForComponent('learningmaterial-search', 'Integration | Component | learningmaterial search' + testgroup, {
  integration: true,
  beforeEach: function() {
    this.container.lookup('service:i18n').set('locale', 'en');
    this.registry.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  this.render(hbs`{{learningmaterial-search}}`);

  assert.equal(this.$().text().trim(), '');
});
