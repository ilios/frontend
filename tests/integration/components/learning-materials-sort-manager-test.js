import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl } from 'ember-intl/test-support';
import { capitalize } from '@ember/string';

const { resolve } = RSVP;

module('Integration | Component | learning materials sort manager', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);

  test('it renders', async function (assert) {
    assert.expect(9);

    const owner1 = EmberObject.create({
      id: 1,
      fullName: 'Hans Wurst',
    });

    const owner2 = EmberObject.create({
      id: 2,
      fullName: 'Hans Dampf',
    });

    const status1 = EmberObject.create({
      id: 1,
      title: 'Done and done',
    });

    const status2 = EmberObject.create({
      id: 2,
      title: 'Draft',
    });

    const lm1 = EmberObject.create({
      title: 'Lorem Ipsum',
      status: status1,
      owningUser: owner1,
      type: 'file',
      mimetype: 'application/pdf',
    });

    const lm2 = EmberObject.create({
      title: 'Foo Bar',
      status: status2,
      owningUser: owner2,
      type: 'citation',
    });

    const clm1 = EmberObject.create({
      id: 1,
      learningMaterial: lm1,
      position: 1,
    });

    const clm2 = EmberObject.create({
      id: 2,
      learningMaterial: lm2,
      position: 0,
    });

    const clms = [clm1, clm2];

    const subject = EmberObject.create({
      learningMaterials: resolve(clms),
    });

    this.set('subject', subject);
    this.set('cancel', () => {});

    await render(
      hbs`<LearningMaterialsSortManager @subject={{this.subject}} @cancel={{this.cancel}} />`
    );

    return settled().then(() => {
      assert.dom('.draggable-object').exists({ count: 2 });
      assert.dom('.draggable-object:nth-of-type(1) [data-test-title]').hasText(lm2.get('title'));
      assert
        .dom('.draggable-object:nth-of-type(1) .lm-type-icon .fa-paragraph')
        .exists({ count: 1 }, 'Shows LM type icon.');

      assert.strictEqual(
        find('.draggable-object:nth-of-type(1) .details').textContent.replace(/[\s\n\t]+/g, ''),
        `${capitalize(lm2.type)}, owned by ${owner2.fullName}, Status: ${status2.title}`.replace(
          /[\s\n\t]+/g,
          ''
        )
      );

      assert.dom('.draggable-object:nth-of-type(2) [data-test-title]').hasText(lm1.get('title'));
      assert
        .dom('.draggable-object:nth-of-type(2) .lm-type-icon .fa-file-pdf')
        .exists({ count: 1 }, 'Shows LM type icon.');

      assert.strictEqual(
        find('.draggable-object:nth-of-type(2) .details').textContent.replace(/[\s\n\t]+/g, ''),
        `${capitalize(lm1.type)}, owned by ${owner1.fullName}, Status: ${status1.title}`.replace(
          /[\s\n\t]+/g,
          ''
        )
      );
      assert.dom('.actions .bigadd').exists({ count: 1 });
      assert.dom('.actions .bigcancel').exists({ count: 1 });
    });
  });

  test('cancel', async function (assert) {
    assert.expect(1);
    const subject = EmberObject.create({
      learningMaterials: resolve([
        EmberObject.create({
          id: 1,
          position: 1,
          learningMaterial: resolve(
            EmberObject.create({
              title: 'First',
            })
          ),
        }),
        EmberObject.create({
          id: 2,
          position: 2,
          learningMaterial: resolve(
            EmberObject.create({
              title: 'Second',
            })
          ),
        }),
      ]),
    });
    this.set('subject', subject);
    this.set('cancel', () => {
      assert.ok(true, 'Cancel action was invoked correctly.');
    });

    await render(
      hbs`<LearningMaterialsSortManager @subject={{this.subject}} @cancel={{this.cancel}} />`
    );

    return settled().then(async () => {
      await click('.actions .bigcancel');
    });
  });

  test('save', async function (assert) {
    assert.expect(3);

    const clm1 = EmberObject.create({
      id: 1,
      position: 1,
      learningMaterial: resolve(
        EmberObject.create({
          title: 'First',
        })
      ),
    });

    const clm2 = EmberObject.create({
      id: 2,
      position: 2,
      learningMaterial: resolve(
        EmberObject.create({
          title: 'Second',
        })
      ),
    });

    const clms = [clm1, clm2];

    const subject = EmberObject.create({
      learningMaterials: resolve(clms),
    });
    this.set('subject', subject);
    this.set('cancel', () => {});

    this.set('save', (data) => {
      assert.strictEqual(data.length, clms.length);
      assert.ok(data.includes(clm1));
      assert.ok(data.includes(clm2));
    });

    await render(
      hbs`<LearningMaterialsSortManager @subject={{this.subject}} @save={{this.save}} @cancel={{this.cancel}} />`
    );

    return settled().then(async () => {
      await click('.actions .bigadd');
    });
  });

  skip('reorder and save', function (assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});
