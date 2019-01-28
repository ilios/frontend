import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
const { resolve } = RSVP;

module('Integration | Component | school vocabularies expanded', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(1);
    const  vocabulary1 = EmberObject.create({title: 'Vocabulary 1', termCount: 2});
    const  vocabulary2 = EmberObject.create({title: 'Vocabulary 2', termCount: 1});
    const term1 = EmberObject.create({ vocabulary: resolve(vocabulary1)});
    const term2 = EmberObject.create({ vocabulary: resolve(vocabulary1)});
    const term3 = EmberObject.create({ vocabulary: resolve(vocabulary2)});
    vocabulary1.set('terms', resolve([term1, term2]));
    vocabulary2.set('terms', resolve([term3]));

    const school = EmberObject.create({
      vocabularies: resolve([vocabulary1, vocabulary2]),
      hasMany() {
        return {
          ids() {
            return [1, 2];
          }
        };
      }
    });

    this.set('school', school);
    this.set('click', () => {});
    await render(
      hbs`{{school-vocabularies-expanded school=school expand=(action click) collapse=(action click)}}`
    );
    const title = '.title';
    return settled().then(() => {
      assert.dom(title).hasText('Vocabularies (2)');
    });
  });
});
