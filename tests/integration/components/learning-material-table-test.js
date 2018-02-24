import { getOwner } from '@ember/application';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/load-common-translations";

module('Integration | Component | learning material table', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.setup = function() {
      initializer.initialize(this.owner);
    };
  });

  test('it renders', async function(assert) {
    const table = 'table';
    const rows = `${table} tbody tr`;
    const title = `${rows}:eq(0) td:eq(0)`;
    const owner = `${rows}:eq(0) td:eq(1)`;
    const required = `${rows}:eq(0) td:eq(2)`;
    const notes = `${rows}:eq(0) td:eq(3)`;
    const mesh = `${rows}:eq(0) td:eq(4)`;
    const status = `${rows}:eq(0) td:eq(5)`;

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

    assert.equal(this.$(rows).length, 1);
    assert.equal(this.$(title).text().trim(), 'test title');
    assert.equal(this.$(owner).text().trim(), 'Jolly Green Champ');
    assert.equal(this.$(required).text().trim(), 'Yes');
    assert.equal(this.$(notes).text().trim(), 'Yes');
    assert.equal(this.$(mesh).text().trim(), 'None');
    assert.equal(this.$(status).text().trim(), 'Good');
  });
});