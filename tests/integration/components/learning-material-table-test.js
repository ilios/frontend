import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, find, findAll } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | learning material table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const table = 'table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:nth-of-type(1) td:nth-of-type(1) [data-test-title]`;
    const owner = `${rows}:nth-of-type(1) td:nth-of-type(2)`;
    const required = `${rows}:nth-of-type(1) td:nth-of-type(3)`;
    const notes = `${rows}:nth-of-type(1) td:nth-of-type(4)`;
    const mesh = `${rows}:nth-of-type(1) td:nth-of-type(5)`;
    const status = `${rows}:nth-of-type(1) td:nth-of-type(6)`;

    const learningMaterial = EmberObject.create({
      learningMaterial: EmberObject.create({
        title: 'test title',
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

    this.set('learningMaterials', [learningMaterial]);
    this.set('nothing', ()=>{});
    await render(hbs`{{learning-material-table
      learningMaterials=learningMaterials
      manageDescriptors=(action nothing)
      editable=true
    }}`);

    assert.equal(findAll(rows).length, 1);
    assert.equal(find(title).textContent.trim(), 'test title');
    assert.equal(find(owner).textContent.trim(), 'Jolly Green Champ');
    assert.equal(find(required).textContent.trim(), 'Yes');
    assert.equal(find(notes).textContent.trim(), 'Yes');
    assert.equal(find(mesh).textContent.trim(), 'None');
    assert.equal(find(status).textContent.trim(), 'Good');
  });
});
