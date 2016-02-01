import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import Ember from 'ember';

const { run } = Ember;
const { next } = run;

moduleForComponent('recently-updated-display', 'Integration | Component | recently updated display', {
  integration: true
});

test('it renders', function(assert) {
  const lastModified = moment().subtract(5, 'day');

  this.set('lastModified', lastModified);
  this.render(hbs`{{recently-updated-display lastModified=lastModified}}`);

  assert.ok(this.$().find('.fa-exclamation-circle').length === 1, 'it renders');
});

test('it does not render', function(assert) {
  const lastModified = moment().subtract(9, 'day');

  this.set('lastModified', lastModified);
  this.render(hbs`{{recently-updated-display}}`);

  next(function() {
    assert.ok(this.$().find('.fa-exclamation-circle').length === 0, 'it does not render');
  });
});
