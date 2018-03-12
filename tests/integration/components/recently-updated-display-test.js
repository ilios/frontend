import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import wait from 'ember-test-helpers/wait';

moduleForComponent('recently-updated-display', 'Integration | Component | recently updated display', {
  integration: true
});

test('it renders', function(assert) {
  const lastModified = moment().subtract(5, 'day');

  this.set('lastModified', lastModified);
  this.render(hbs`{{recently-updated-display lastModified=lastModified}}`);

  return wait().then(()=>{
    assert.equal(this.$('.fa-exclamation-circle').length, 1, 'it renders');
  });
});

test('it does not render', function(assert) {
  const lastModified = moment().subtract(9, 'day');

  this.set('lastModified', lastModified);
  this.render(hbs`{{recently-updated-display}}`);

  return wait().then(()=>{
    assert.equal(this.$('.fa-exclamation-circle').length, 0, 'it does not renders');
  });
});
