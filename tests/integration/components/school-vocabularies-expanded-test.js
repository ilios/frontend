import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import initializer from "ilios/instance-initializers/ember-i18n";
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

const { Object:EmberObject, RSVP } = Ember;
const { resolve } = RSVP;

moduleForComponent('school-vocabularies-expanded', 'Integration | Component | school vocabularies expanded', {
  integration: true,
  setup(){
    initializer.initialize(this);
  }
});

test('it renders', function(assert) {
  assert.expect(1);
  const  vocabulary1 = EmberObject.create({title: 'Vocabulary 1', termCount: 2});
  const  vocabulary2 = EmberObject.create({title: 'Vocabulary 2', termCount: 1});
  const term1 = EmberObject.create({ vocabulary: resolve(vocabulary1)});
  const term2 = EmberObject.create({ vocabulary: resolve(vocabulary1)});
  const term3 = EmberObject.create({ vocabulary: resolve(vocabulary2)});
  vocabulary1.set('terms', resolve([term1, term2]));
  vocabulary2.set('terms', resolve([term3]));

  const school = EmberObject.create({
    vocabularies: resolve([vocabulary1, vocabulary2])
  });


  this.set('school', school);
  this.on('click', parseInt);
  this.render(hbs`{{school-vocabularies-expanded school=school expand=(action 'click') collapse=(action 'click')}}`);
  const title = '.title';
  return wait().then(() => {
    assert.equal(this.$(title).text().trim(), 'Vocabularies (2)');
  });
});
