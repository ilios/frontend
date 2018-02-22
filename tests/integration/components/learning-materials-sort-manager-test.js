import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import tHelper from "ember-i18n/helper";
const { resolve } = RSVP;

module('Integration | Component | learning materials sort manager', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.actions = {};
    this.send = (actionName, ...args) => this.actions[actionName].apply(this, args);
  });

  hooks.beforeEach(function () {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(9);

    let owner1 = EmberObject.create({
      id: 1,
      fullName: 'Hans Wurst'
    });

    let owner2 = EmberObject.create({
      id: 2,
      fullName: 'Hans Dampf'
    });

    let status1 = EmberObject.create({
      id: 1,
      title: 'Done and done'
    });

    let status2 = EmberObject.create({
      id: 2,
      title: 'Draft'
    });

    let lm1 = EmberObject.create({
      title: 'Lorem Ipsum',
      status: status1,
      owningUser: owner1,
      type: 'file',
      mimetype: 'application/pdf'
    });

    let lm2 = EmberObject.create({
      title: 'Foo Bar',
      status: status2,
      owningUser: owner2,
      type: 'citation'
    });

    let clm1 = EmberObject.create({
      id: 1,
      learningMaterial: lm1,
      position: 1,
    });

    let clm2 = EmberObject.create({
      id: 2,
      learningMaterial: lm2,
      position: 0,
    });

    let clms = [ clm1, clm2 ];

    let subject = EmberObject.create({
      learningMaterials: resolve(clms)
    });

    this.set('subject', subject);

    await render(hbs`{{learning-materials-sort-manager subject=subject}}`);

    return settled().then(() => {
      assert.equal(this.$('.draggable-object').length, 2);
      assert.equal(this.$('.draggable-object:eq(0) .title').text().trim(), lm2.get('title'));
      assert.equal(this.$('.draggable-object:eq(0) .lm-type-icon .fa-paragraph').length, 1, 'Shows LM type icon.');

      assert.equal(
        this.$('.draggable-object:eq(0) .details').text().replace(/[\s\n\t]+/g, ''),
        `${lm2.type.capitalize()}, owned by ${owner2.fullName}, Status: ${status2.title}`.replace(/[\s\n\t]+/g, '')
      );

      assert.equal(this.$('.draggable-object:eq(1) .title').text().trim(), lm1.get('title'));
      assert.equal(this.$('.draggable-object:eq(1) .lm-type-icon .fa-file-pdf-o').length, 1, 'Shows LM type icon.');

      assert.equal(
        this.$('.draggable-object:eq(1) .details').text().replace(/[\s\n\t]+/g, ''),
        `${lm1.type.capitalize()}, owned by ${owner1.fullName}, Status: ${status1.title}`.replace(/[\s\n\t]+/g, '')
      );
      assert.equal(this.$('.actions .bigadd').length, 1);
      assert.equal(this.$('.actions .bigcancel').length, 1);
    });
  });

  test('cancel', async function(assert) {
    assert.expect(1);
    let subject = EmberObject.create({
      learningMaterials: resolve([
        EmberObject.create({
          id: 1,
          position: 1,
          learningMaterial: resolve(EmberObject.create({
            title: 'First'
          }))
        }),
        EmberObject.create({
          id: 2,
          position: 2,
          learningMaterial: resolve(EmberObject.create({
            title: 'Second'
          }))
        })
      ]),
    });
    this.set('subject', subject);
    this.actions.cancel = function(){
      assert.ok(true, 'Cancel action was invoked correctly.');
    };

    await render(hbs`{{learning-materials-sort-manager subject=subject cancel=(action 'cancel')}}`);

    return settled().then(() => {
      this.$('.actions .bigcancel').click();
    });
  });

  test('save', async function(assert) {
    assert.expect(3);

    let clm1 = EmberObject.create({
      id: 1,
      position: 1,
      learningMaterial: resolve(EmberObject.create({
        title: 'First'
      }))
    });

    let clm2 = EmberObject.create({
      id: 2,
      position: 2,
      learningMaterial: resolve(EmberObject.create({
        title: 'Second'
      }))
    });

    let clms = [ clm1, clm2 ];

    let subject = EmberObject.create({
      learningMaterials: resolve(clms),
    });
    this.set('subject', subject);
    this.actions.save = function(data){
      assert.equal(data.length, clms.length);
      assert.ok(data.includes(clm1));
      assert.ok(data.includes(clm2));
    };

    await render(hbs`{{learning-materials-sort-manager subject=subject save=(action 'save')}}`);

    return settled().then(() => {
      this.$('.actions .bigadd').click();
    });
  });

  skip('reorder and save', function(assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});