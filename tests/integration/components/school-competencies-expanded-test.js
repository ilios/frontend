import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject } = Ember;

moduleForComponent('school-competencies-expanded', 'Integration | Component | school competencies expanded', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(4);
  let domain = server.create('competency', {school: 1, isDomain: true});
  let competency1 = server.create('competency', {school: 1, parent: 1, isNotDomain: true});
  let competency2 = server.create('competency', {school: 1, parent: 1, isNotDomain: true});
  domain.children = [competency1, competency2];

  let competencies = [domain, competency1, competency2].map(obj => EmberObject.create(obj));

  const school = EmberObject.create({
    competencies
  });


  this.set('school', school);
  this.on('collapse', parseInt);
  this.on('expand', parseInt);
  this.render(hbs`{{school-competencies-expanded school=school expand=(action 'expand') collapse=(action 'expand')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Competencies \(1\/2\)/), 0);
    assert.ok(this.$().text().trim().search(/competency 0/) > 0);
    assert.ok(this.$().text().trim().search(/competency 1/) > 0);
    assert.ok(this.$().text().trim().search(/competency 2/) > 0);
  });

});
