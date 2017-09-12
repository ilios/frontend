import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
const { Object:EmberObject } = Ember;

moduleForComponent('learning-material-table', 'Integration | Component | learning material table', {
  integration: true
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
  this.render(hbs`{{learning-material-table
    learningMaterials=learningMaterials
    manageDescriptors=(action nothing)
    editable=true
  }}`);

  assert.equal(this.$(rows).length, 1);
  assert.equal(this.$(title).text().trim(), 'test title');
  assert.equal(this.$(owner).text().trim(), 'Jolly Green Champ');
  assert.equal(this.$(required).text().trim(), 'Yes');
  assert.equal(this.$(notes).text().trim(), 'Yes');
  assert.equal(this.$(mesh).text().trim(), 'Add New');
  assert.equal(this.$(status).text().trim(), 'Good');
});
