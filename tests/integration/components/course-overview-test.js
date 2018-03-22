import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

let storeMock;
moduleForComponent('course-overview', 'Integration | Component | course overview', {
  integration: true,
  beforeEach(){
    storeMock = Service.extend({});
    this.register('service:store', storeMock);
  }
});

const { resolve } = RSVP;

test('renders with no course id', function(assert) {
  storeMock.reopen({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });

  let course = EmberObject.create({
    clerkshipType: resolve(EmberObject.create())
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  assert.notEqual(this.$('.courseexternalid').text().search(/Course ID:/), -1);
  assert.notEqual(this.$('.courseexternalid').text().search(/Click to edit/), -1);

});

test('course external id validation fails if value is too short', function(assert) {
  storeMock.reopen({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });

  let course = EmberObject.create({
    clerkshipType: resolve(EmberObject.create()),
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const button = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(button).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('a').trigger('input');
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
    });
  });
});

test('course external id validation fails if value is too long', function(assert) {
  storeMock.reopen({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });

  let course = EmberObject.create({
    clerkshipType: resolve(EmberObject.create()),
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const button = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(button).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('tooLong'.repeat(50)).trigger('input');
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
    });
  });
});

test('course external id validation passes on changed value within boundaries', function(assert) {
  storeMock.reopen({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });

  let course = EmberObject.create({
    clerkshipType: resolve(EmberObject.create()),
    externalid: 'abcde',
    save() {
      let that = this;
      assert.ok(true, 'Validation passed, course object is being saved.');
      return new RSVP.Promise(function(resolve) {
        resolve(that);
      });
    },
    get(value) {
      return this[value];
    }
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const button = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(button).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('legit').trigger('input');
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
    });
  });
});

test('course external id validation passes on empty value', function(assert) {
  storeMock.reopen({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });

  let course = EmberObject.create({
    clerkshipType: resolve(EmberObject.create()),
    externalid: 'abcde',
    save() {
      let that = this;
      assert.ok(true, 'Validation passed, course object is being saved.');
      return new RSVP.Promise(function(resolve) {
        resolve(that);
      });
    },
    get(value) {
      return this[value];
    }
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const button = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(button).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('').trigger('input');
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
    });
  });
});
