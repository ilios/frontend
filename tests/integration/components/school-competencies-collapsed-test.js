import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object:EmberObject } = Ember;

moduleForComponent('school-competencies-collapsed', 'Integration | Component | school competencies collapsed', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(3);
  let domain = server.create('competency', {school: 1, isDomain: true, children: [2]});
  let competency = server.create('competency', {school: 1, isNotDomain: true, parent: 1});

  let competencies = [domain, competency];

  const school = EmberObject.create({
    competencies
  });


  this.set('school', school);
  this.on('click', parseInt);
  this.render(hbs`{{school-competencies-collapsed school=school expand=(action 'click')}}`);

  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Competencies \(1\/1\)/), 0);
    assert.ok(this.$().text().trim().search(/competency 0/) > 0);
    assert.ok(this.$().text().trim().search(/There is 1 competency/) > 0);
  });

});
