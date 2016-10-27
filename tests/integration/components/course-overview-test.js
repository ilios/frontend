import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent('course-overview', 'Integration | Component | course overview', {
  integration: true
});

const { Object, Service, RSVP } = Ember;
const { resolve } = RSVP;

test('renders with no course id', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create())
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  assert.notEqual(this.$('.courseexternalid').text().search(/Course ID:/), -1);
  assert.notEqual(this.$('.courseexternalid').text().search(/Click to edit/), -1);

});

test('course external id validation fails if value is too short', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create()),
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const open = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(open).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('a').change();
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
    });
  });
});

test('course external id validation fails if value is too long', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create()),
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const item = '.courseexternalid';
  const error = `${item} .validation-error-message`;
  const open = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(open).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('tooLong'.repeat(50)).change();
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
    });
  });
});

test('course external id validation passes on changed value within boundaries', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create()),
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
  const open = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(open).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('legit').change();
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
    });
  });
});

test('course external id validation passes on empty value', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create()),
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
  const open = `${item} .clickable`;
  const save = `${item} .actions .done`;
  const input = `${item} input`;
  this.$(open).click();
  return wait().then(()=>{
    assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
    this.$(input).val('').change();
    this.$(save).click();
    wait().then(() => {
      assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
    });
  });
});

test('shows a list of course directors', function(assert) {
  let storeMock = Service.extend({
    findAll(what){
      assert.equal('course-clerkship-type', what);
      return resolve([]);
    }
  });
  this.register('service:store', storeMock);

  let course = Object.create({
    clerkshipType: resolve(Object.create()),
    directors: resolve([
      Object.create({ 'fullName': 'Adam Zyzzyva', 'lastName': 'Zyzzyva' }),
      Object.create({ 'fullName': 'Zoe Aaardvark', 'lastName': 'Aardvark' }),
      Object.create({ 'fullName': 'Mike Middleman', 'lastName': 'Middleman' })
    ])
  });
  this.set('course', course);
  this.render(hbs`{{course-overview course=course}}`);

  const directorsList = '.coursedirectors ul';
  assert.equal(this.$(`${directorsList} li:eq(0)`).text().trim(), 'Zoe Aaardvark');
  assert.equal(this.$(`${directorsList} li:eq(1)`).text().trim(), 'Mike Middleman');
  assert.equal(this.$(`${directorsList} li:eq(2)`).text().trim(), 'Adam Zyzzyva');
});
