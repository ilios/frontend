import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | course overview', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  const { resolve } = RSVP;

  test('renders with no course id', async function(assert) {
    let course = EmberObject.create({
      clerkshipType: resolve(EmberObject.create())
    });
    this.set('course', course);
    await render(hbs`{{course-overview course=course editable=true}}`);

    assert.notEqual(find('.courseexternalid').textContent.search(/Course ID:/), -1);
    assert.notEqual(find('.courseexternalid').textContent.search(/Click to edit/), -1);
  });

  test('course external id validation fails if value is too short', async function(assert) {
    let course = EmberObject.create({
      clerkshipType: resolve(EmberObject.create()),
    });
    this.set('course', course);
    await render(hbs`{{course-overview course=course editable=true}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    find(button).click();
    return settled().then(()=>{
      assert.equal(findAll(error).length, 0, 'No validation errors shown initially.');
      find(input).val('a').trigger('input');
      find(save).click();
      settled().then(() => {
        assert.equal(findAll(error).length, 1, 'Validation failed, error message shows.');
      });
    });
  });

  test('course external id validation fails if value is too long', async function(assert) {
    let course = EmberObject.create({
      clerkshipType: resolve(EmberObject.create()),
    });
    this.set('course', course);
    await render(hbs`{{course-overview course=course editable=true}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    find(button).click();
    return settled().then(()=>{
      assert.equal(findAll(error).length, 0, 'No validation errors shown initially.');
      find(input).val('tooLong'.repeat(50)).trigger('input');
      find(save).click();
      settled().then(() => {
        assert.equal(findAll(error).length, 1, 'Validation failed, error message shows.');
      });
    });
  });

  test('course external id validation passes on changed value within boundaries', async function(assert) {
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
    find(button).click();
    return settled().then(()=>{
      assert.equal(findAll(error).length, 0, 'No validation errors shown initially.');
      find(input).val('legit').trigger('input');
      find(save).click();
      settled().then(() => {
        assert.equal(findAll(error).length, 0, 'No validation errors, no messages shown.');
      });
    });
  });

  test('course external id validation passes on empty value', async function(assert) {
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
    find(button).click();
    return settled().then(()=>{
      assert.equal(findAll(error).length, 0, 'No validation errors shown initially.');
      find(input).val('').trigger('input');
      find(save).click();
      settled().then(() => {
        assert.equal(findAll(error).length, 0, 'No validation errors, no messages shown.');
      });
    });
  });
});
