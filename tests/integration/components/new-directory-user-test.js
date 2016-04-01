import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";

const { Service, Object, RSVP } = Ember;
const { resolve } = RSVP;

const mockSchools = [
  {id: 2, title: 'second', cohorts: resolve([])},
  {id: 1, title: 'first', cohorts: resolve([])},
  {id: 3, title: 'third', cohorts: resolve([])},
];
const mockUser = Object.create({
  schools: resolve(mockSchools),
  school: resolve(Object.create(mockSchools[0]))
});

const currentUserMock = Service.extend({
  model: resolve(mockUser)
});

moduleForComponent('new-directory-user', 'Integration | Component | new directory user', {
  integration: true,
  setup(){
    initializer.initialize(this);
  },
  beforeEach(){
    this.register('service:current-user', currentUserMock);
    this.inject.service('current-user', { as: 'current-user' });
  }
});

test('it renders', function(assert) {
  this.set('close', () => {});

  this.render(hbs`{{new-user close=(action close)}}`);

  return wait().then(() => {
    let content = this.$().text().trim();
    assert.notEqual(content.search(/New User/), -1);
    assert.notEqual(content.search(/First Name/), -1);
    assert.notEqual(content.search(/Last Name/), -1);
    assert.notEqual(content.search(/Middle Name/), -1);
    assert.notEqual(content.search(/Campus ID/), -1);
    assert.notEqual(content.search(/Other ID/), -1);
    assert.notEqual(content.search(/Email/), -1);
    assert.notEqual(content.search(/Phone/), -1);
    assert.notEqual(content.search(/Username/), -1);
    assert.notEqual(content.search(/Password/), -1);
    assert.notEqual(content.search(/Primary School/), -1);

    let options = this.$('option');
    assert.equal(options.length, mockSchools.length);
    assert.equal(options.eq(0).text().trim(), 'first');
    assert.equal(options.eq(1).text().trim(), 'second');
    assert.equal(options.eq(2).text().trim(), 'third');
  });
});

test('errors do not show up initially', function(assert) {
  this.set('close', () => {
    assert.ok(false); //shouldn't be called
  });
  this.render(hbs`{{new-user close=(action close)}}`);

  return wait().then(() => {
    assert.equal(this.$('.validation-error-message').length, 0);

  });
});

test('errors show up', function(assert) {
  this.set('close', () => {
    assert.ok(false); //shouldn't be called
  });
  this.render(hbs`{{new-user close=(action close)}}`);

  return wait().then(() => {
    this.$('.done').click();
    return wait().then(() => {
      let boxes = this.$('.form-data');
      assert.ok(boxes.eq(1).text().search(/blank/) > -1);
      assert.ok(boxes.eq(3).text().search(/blank/) > -1);
      assert.ok(boxes.eq(6).text().search(/blank/) > -1);
      assert.ok(boxes.eq(8).text().search(/blank/) > -1);
      assert.ok(boxes.eq(9).text().search(/blank/) > -1);
    });

  });
});
