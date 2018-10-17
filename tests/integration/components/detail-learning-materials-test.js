import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, settled, click, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | detail learning materials', function(hooks) {
  setupRenderingTest(hooks);


  test('lm table items', async function(assert) {
    assert.expect(8);
    const table = 'table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
    const owner = `${rows}:nth-of-type(1) td:nth-of-type(2)`;
    const required = `${rows}:nth-of-type(1) td:nth-of-type(3)`;
    const notes = `${rows}:nth-of-type(1) td:nth-of-type(4)`;
    const mesh = `${rows}:nth-of-type(1) td:nth-of-type(5)`;
    const status = `${rows}:nth-of-type(1) td:nth-of-type(6)`;

    const clm = EmberObject.create({
      id: 1,
      learningMaterial: EmberObject.create({
        title: 'test title',
        type: 'citation',
        owningUser: EmberObject.create({
          fullName: 'Jolly Green Champ'
        }),
        status: EmberObject.create({
          title: 'Good'
        }),
      }),
      required: true,
      notes: 'notes',
    });

    const subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve([clm])
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials
      subject=subject
      isCourse=true
      isCourse=true
      editable=true
    }}`);
    assert.equal(findAll(rows).length, 1);
    assert.ok(find(title).textContent.trim().startsWith('Citation'));
    assert.ok(find(title).textContent.trim().endsWith('test title'));
    assert.equal(find(owner).textContent.trim(), 'Jolly Green Champ');
    assert.equal(find(required).textContent.trim(), 'Yes');
    assert.equal(find(notes).textContent.trim(), 'Yes');
    assert.equal(find(mesh).textContent.trim(), 'None');
    assert.equal(find(status).textContent.trim(), 'Good');
  });

  test('sort button visible when lm list has 2+ items and editing is allowed', async function(assert) {
    assert.expect(1);

    let clm1 = EmberObject.create({
      id: 1,
      learningMaterial: resolve(EmberObject.create({
        id: 1,
      }))
    });

    let clm2 = EmberObject.create({
      id: 2,
      learningMaterial: resolve(EmberObject.create({
        id: 2,
      }))
    });
    let clms = [ clm1, clm2 ];

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve(clms)
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

    return settled().then(() => {
      assert.equal(findAll('.sort-materials-btn').length, 1);
    });
  });

  test('sort button not visible when in read-only mode', async function(assert) {
    assert.expect(1);

    let lm1 = EmberObject.create({
      id: 1,
    });

    let lm2 = EmberObject.create({
      id: 2,
    });
    let lms = [ lm1, lm2 ];

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve(lms)
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=false }}`);

    return settled().then(() => {
      assert.equal(findAll('.sort-materials-btn').length, 0);
    });
  });

  test('sort button not visible when lm list is empty', async function(assert) {
    assert.expect(1);

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve([])
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

    return settled().then(() => {
      assert.equal(findAll('.sort-materials-btn').length, 0);
    });
  });

  test('sort button not visible when lm list only contains one item', async function(assert) {
    let clm1 = EmberObject.create({
      id: 1,
      learningMaterial: resolve(EmberObject.create({
        id: 1,
      }))
    });

    let clms = [ clm1 ];

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve(clms)
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

    return settled().then(() => {
      assert.equal(findAll('.sort-materials-btn').length, 0);
    });
  });

  test('click sort button, then cancel', async function(assert) {
    assert.expect(6);

    let clm1 = EmberObject.create({
      id: 1,
      learningMaterial: resolve(EmberObject.create({
        id: 1,
      }))
    });

    let clm2 = EmberObject.create({
      id: 2,
      learningMaterial: resolve(EmberObject.create({
        id: 2,
      }))
    });
    let clms = [ clm1, clm2 ];

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve(clms)
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

    return settled().then(async () => {
      assert.equal(findAll('.sort-materials-btn').length, 1, 'Sort materials button is visible');
      assert.equal(findAll('.learning-materials-sort-manager').length, 0, 'LM sort manager is not visible');

      await click('.sort-materials-btn');
      return settled().then(async () => {
        assert.equal(findAll('.sort-materials-btn').length, 0, 'Sort materials button is not visible');
        assert.equal(findAll('.learning-materials-sort-manager').length, 1, 'LM sort manager is visible');
        await click('.learning-materials-sort-manager .bigcancel');
        return settled().then(() => {
          assert.equal(findAll('.sort-materials-btn').length, 1, 'Sort materials button is visible again');
          assert.equal(findAll('.learning-materials-sort-manager').length, 0, 'LM sort manager is not visible again');
        });
      });
    });
  });

  test('click sort button, then save', async function(assert) {
    assert.expect(2);

    let clm1 = EmberObject.create({
      id: 1,
      learningMaterial: resolve(EmberObject.create({
        id: 1,
      })),
      save() {
        assert.ok(true, 'Save() method was invoked');
        resolve(this);
      }
    });

    let clm2 = EmberObject.create({
      id: 2,
      learningMaterial: resolve(EmberObject.create({
        id: 2,
      })),
      save() {
        assert.ok(true, 'Save() method was invoked');
        resolve(this);
      }
    });
    let clms = [ clm1, clm2 ];

    let subject = EmberObject.create({
      id: 1,
      learningMaterials: resolve(clms)
    });

    this.set('subject', subject);

    await render(hbs`{{detail-learning-materials subject=subject isCourse=true editable=true}}`);

    return settled().then(async () => {
      await click('.sort-materials-btn');
      return settled().then(async () => {
        await click('.learning-materials-sort-manager .bigadd');
      });
    });
  });
});
