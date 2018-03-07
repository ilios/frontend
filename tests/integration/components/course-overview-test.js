import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

let storeMock;

module('Integration | Component | course overview', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    storeMock = Service.extend({});
    this.owner.register('service:store', storeMock);
  });

  const { resolve } = RSVP;

  test('renders with no course id', async function(assert) {
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
    await render(hbs`{{course-overview course=course}}`);

    assert.notEqual(this.$('.courseexternalid').text().search(/Course ID:/), -1);
    assert.notEqual(this.$('.courseexternalid').text().search(/Click to edit/), -1);

  });

  test('course external id validation fails if value is too short', async function(assert) {
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
    await render(hbs`{{course-overview course=course}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    this.$(button).click();
    return settled().then(()=>{
      assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
      this.$(input).val('a').trigger('input');
      this.$(save).click();
      settled().then(() => {
        assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
      });
    });
  });

  test('course external id validation fails if value is too long', async function(assert) {
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
    await render(hbs`{{course-overview course=course}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    this.$(button).click();
    return settled().then(()=>{
      assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
      this.$(input).val('tooLong'.repeat(50)).trigger('input');
      this.$(save).click();
      settled().then(() => {
        assert.equal(this.$(error).length, 1, 'Validation failed, error message shows.');
      });
    });
  });

  test('course external id validation passes on changed value within boundaries', async function(assert) {
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
    await render(hbs`{{course-overview course=course}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    this.$(button).click();
    return settled().then(()=>{
      assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
      this.$(input).val('legit').trigger('input');
      this.$(save).click();
      settled().then(() => {
        assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
      });
    });
  });

  test('course external id validation passes on empty value', async function(assert) {
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
    await render(hbs`{{course-overview course=course}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    this.$(button).click();
    return settled().then(()=>{
      assert.equal(this.$(error).length, 0, 'No validation errors shown initially.');
      this.$(input).val('').trigger('input');
      this.$(save).click();
      settled().then(() => {
        assert.equal(this.$(error).length, 0, 'No validation errors, no messages shown.');
      });
    });
  });

  test('shows a list of course directors', async function(assert) {
    storeMock.reopen({
      findAll(what){
        assert.equal('course-clerkship-type', what);
        return resolve([]);
      }
    });

    let course = EmberObject.create({
      clerkshipType: resolve(EmberObject.create()),
      directors: resolve([
        EmberObject.create({ 'fullName': 'Adam Zyzzyva', 'lastName': 'Zyzzyva' }),
        EmberObject.create({ 'fullName': 'Zoe Aaardvark', 'lastName': 'Aardvark' }),
        EmberObject.create({ 'fullName': 'Mike Middleman', 'lastName': 'Middleman' })
      ])
    });
    this.set('course', course);
    await render(hbs`{{course-overview course=course}}`);

    const directorsList = '.coursedirectors ul';
    assert.equal(this.$(`${directorsList} li:eq(0)`).text().trim(), 'Zoe Aaardvark');
    assert.equal(this.$(`${directorsList} li:eq(1)`).text().trim(), 'Mike Middleman');
    assert.equal(this.$(`${directorsList} li:eq(2)`).text().trim(), 'Adam Zyzzyva');
  });
});
