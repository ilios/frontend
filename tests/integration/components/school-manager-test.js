import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('school-manager', 'Integration | Component | school manager', {
  integration: true
});

test('it renders', function(assert) {
  this.on('nothing', parseInt);
  this.render(hbs`{{school-manager setSchoolCompetencyDetails=(action 'nothing')  setSchoolManageCompetencies=(action 'nothing')}}`);

  assert.notEqual(this.$().text().search(/Back to Schools List/), -1);
});
