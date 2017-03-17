import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import initializer from "ilios/instance-initializers/ember-i18n";
import startMirage from '../../helpers/start-mirage';
import Ember from 'ember';

const { Object:EmberObject, RSVP } = Ember;

moduleForComponent('school-vocabularies-expanded', 'Integration | Component | school vocabularies expanded', {
  integration: true,
  setup(){
    initializer.initialize(this);
    startMirage(this.container);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  let  vocabulary1 = server.create('vocabulary', {school: 1, terms: [1, 2]});
  let  vocabulary2 = server.create('vocabulary', {school: 1, terms: [3]});
  server.createList('term', 1, { vocabulary: [1]});
  server.createList('term', 2, { vocabulary: [2]});

  let vocabularies = [vocabulary1, vocabulary2];

  const school = EmberObject.create({
    vocabularies: RSVP.resolve(vocabularies)
  });


  this.set('school', school);
  this.on('click', parseInt);
  this.render(hbs`{{school-vocabularies-expanded school=school expand=(action 'click') collapse=(action 'click')}}`);
  return wait().then(() => {
    assert.equal(this.$().text().trim().search(/Vocabularies/), 0);
  });

});
