import EmberObject from '@ember/object';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('learning-material-table-title', 'Integration | Component | learning material table title', {
  integration: true
});

test('it renders with a type icon', function (assert) {
  const row = EmberObject.create({
    learningMaterial: EmberObject.create({
      type: 'file',
      mimetype: 'application/pdf'
    })
  });
  const i = 'i';
  this.set('row', row);
  this.render(hbs`{{learning-material-table-title value='test' row=row}}`);

  assert.equal(this.$().text().trim(), 'test');
  assert.ok(this.$(i).hasClass('fa-file-pdf-o'));
});
