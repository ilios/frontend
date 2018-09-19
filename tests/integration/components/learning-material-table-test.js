import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';


module('Integration | Component | learning material table', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    const table = 'table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:nth-of-type(1) td:nth-of-type(1)`;
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

    assert.dom(rows).exists({ count: 1 });
    assert.dom(title).hasText('test title');
    assert.dom(owner).hasText('Jolly Green Champ');
    assert.dom(required).hasText('Yes');
    assert.dom(notes).hasText('Yes');
    assert.dom(mesh).hasText('None');
    assert.dom(status).hasText('Good');
  });
});
