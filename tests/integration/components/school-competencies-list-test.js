import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject } = Ember;

moduleForComponent('school-competencies-list', 'Integration | Component | school competencies list', {
  integration: true,
  setup(){
    startMirage(this.container);
  }
});



test('it renders', function(assert) {
  assert.expect(3);
  let domain = server.create('competency', {school: 1, isDomain: true});
  let competency1 = server.create('competency', {school: 1, parent: 1});
  let competency2 = server.create('competency', {school: 1, parent: 1});
  domain.children = [competency1, competency2];

  let competencies = [domain, competency1, competency2].map(obj => EmberObject.create(obj));


  this.set('competencies', competencies);
  this.render(hbs`{{school-competencies-list competencies=competencies}}`);
  return wait().then(() => {
    assert.ok(this.$().text().trim().search(/competency 0/) > -1);
    assert.ok(this.$().text().trim().search(/competency 1/) > -1);
    assert.ok(this.$().text().trim().search(/competency 2/) > -1);
  });

});
