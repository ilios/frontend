import { getOwner } from '@ember/application';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import commonInitializer from "ilios/instance-initializers/load-common-translations";
import moment from 'moment';

moduleForComponent('session-table-first-offering', 'Integration | Component | session table first offering', {
  integration: true,
  setup(){
    commonInitializer.initialize(getOwner(this));
  }
});

test('it renders empty', function(assert) {
  this.set('row', {
    firstOfferingDate: null
  });
  this.render(hbs`{{session-table-first-offering row=row}}`);

  assert.equal(this.$().text().trim(), '');
});

test('it renders offering', function(assert) {
  const today = moment();
  this.set('row', {
    isIlm: false,
    firstOfferingDate: today.toDate()
  });
  this.render(hbs`{{session-table-first-offering row=row}}`);

  assert.equal(this.$().text().trim(), today.format('L LT'));
});

test('it renders ilm', function(assert) {
  const today = moment();
  this.set('row', {
    isIlm: true,
    firstOfferingDate: today.toDate()
  });
  this.render(hbs`{{session-table-first-offering row=row}}`);

  assert.equal(this.$().text().trim(), 'ILM: Due By ' + today.format('L'));
});
