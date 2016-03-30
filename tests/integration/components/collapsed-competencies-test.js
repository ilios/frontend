import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const { Object } = Ember;

moduleForComponent('collapsed-competencies', 'Integration | Component | collapsed competencies', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  let domain = server.create('competency', {school: 1, isDomain: true, children: [2]});
  let competency = server.create('competency', {school: 1, parent: 1});
  let competencies = [domain, competency].map(obj => Object.create(obj));

  const course = Object.create({
    competencies
  });

  this.set('course', course);
  this.on('click', parseInt);
  this.render(hbs`{{collapsed-competencies subject=course expand=(action 'click')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Competencies \(2\)/), 0);
  });

});
