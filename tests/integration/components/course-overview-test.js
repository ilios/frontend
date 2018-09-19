import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  click,
  render,
  find,
  fillIn
} from '@ember/test-helpers';
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
    await click(button);
    assert.dom(error).doesNotExist('No validation errors shown initially.');
    await fillIn(input, 'a');
    await click(save);
    assert.dom(error).exists({ count: 1 }, 'Validation failed, error message shows.');
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
    await click(button);
    assert.dom(error).doesNotExist('No validation errors shown initially.');
    await fillIn(input, 'tooLong'.repeat(50));
    await click(save);
    assert.dom(error).exists({ count: 1 }, 'Validation failed, error message shows.');
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
    await render(hbs`{{course-overview course=course editable=true}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    await click(button);
    assert.dom(error).doesNotExist('No validation errors shown initially.');
    await fillIn(input, 'legit');
    await click(save);
    assert.dom(error).doesNotExist('No validation errors, no messages shown.');
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
    await render(hbs`{{course-overview course=course editable=true}}`);

    const item = '.courseexternalid';
    const error = `${item} .validation-error-message`;
    const button = `${item} .clickable`;
    const save = `${item} .actions .done`;
    const input = `${item} input`;
    await click(button);
    assert.dom(error).doesNotExist('No validation errors shown initially.');
    await fillIn(input, '');
    await click(save);
    assert.dom(error).doesNotExist('No validation errors, no messages shown.');
  });
});
