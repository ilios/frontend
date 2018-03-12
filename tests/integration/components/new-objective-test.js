import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";

moduleForComponent('new-objective', 'Integration | Component | new objective', {
  integration: true,
  setup(){
    initializer.initialize(this);
  }
});


test('it renders', function(assert) {
  this.set('cancel', () => {});

  this.render(hbs`{{new-objective cancel=(action cancel)}}`);

  return wait().then(() => {
    let content = this.$().text().trim();
    assert.notEqual(content.search(/New Objective/), -1);
    assert.notEqual(content.search(/Description/), -1);
  });
});

test('errors do not show up initially', function(assert) {
  this.set('cancel', () => {
    assert.ok(false); //shouldn't be called
  });
  this.render(hbs`{{new-objective cancel=(action cancel)}}`);

  return wait().then(() => {
    assert.equal(this.$('.validation-error-message').length, 0);

  });
});

test('errors show up', function(assert) {
  this.set('cancel', () => {
    assert.ok(false); //shouldn't be called
  });
  this.render(hbs`{{new-objective cancel=(action cancel)}}`);

  return wait().then(() => {
    this.$('.done').click();
    return wait().then(() => {
      let boxes = this.$('.form-data');
      assert.ok(boxes.eq(0).text().search(/blank/) > -1);
    });

  });
});
