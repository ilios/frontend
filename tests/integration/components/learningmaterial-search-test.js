import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";

moduleForComponent('learningmaterial-search', 'Integration | Component | learningmaterial search', {
  integration: true,
  beforeEach: function() {
    getOwner(this).lookup('service:i18n').set('locale', 'en');
    this.register('helper:t', tHelper);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  this.render(hbs`{{learningmaterial-search}}`);

  assert.equal(this.$().text().trim(), '');
});
