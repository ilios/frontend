import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | school vocabularies collapsed', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
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
    this.set('click', () => {});
    await render(hbs`{{school-vocabularies-collapsed school=school expand=(action click)}}`);

    const title = '.title';
    const vocabularies = 'table tbody tr';
    const vocabulary1Title = `${vocabularies}:eq(0) td:eq(0)`;
    const vocabulary1Terms = `${vocabularies}:eq(0) td:eq(1)`;
    const vocabulary2Title = `${vocabularies}:eq(1) td:eq(0)`;
    const vocabulary2Terms = `${vocabularies}:eq(1) td:eq(1)`;

    await settled();
    assert.equal(find(title).textContent.trim(), 'Vocabularies (2)');
    assert.equal(this.$(vocabulary1Title).text().trim(), 'Vocabulary 1');
    assert.equal(this.$(vocabulary1Terms).text().trim(), 'There are 2 terms');
    assert.equal(this.$(vocabulary2Title).text().trim(), 'Vocabulary 2');
    assert.equal(this.$(vocabulary2Terms).text().trim(), 'There is 1 term');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(2);
    const  vocabulary = EmberObject.create();
    const school = EmberObject.create({
      vocabularies: resolve([vocabulary])
    });
    const title = '.title';

    this.set('school', school);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`{{school-vocabularies-collapsed school=school expand=(action click)}}`);

    await settled();
    assert.equal(find(title).textContent.trim(), 'Vocabularies (1)');
    await click(title);
  });
});
