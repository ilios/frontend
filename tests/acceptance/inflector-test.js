import { pluralize,singularize } from 'ember-inflector';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { module, test } from 'qunit';

module('Acceptance | inflector', function (hooks) {
  setupApplicationTest(hooks);

  test('custom inflector rules', async function (assert) {
    assert.strictEqual(pluralize('aamc-pcrs'), 'aamc-pcrses');
    assert.strictEqual(singularize('aamc-pcrses'), 'aamc-pcrs');
    assert.strictEqual(pluralize('vocabulary'), 'vocabularies');
    assert.strictEqual(singularize('vocabularies'), 'vocabulary');
    assert.strictEqual(pluralize('pcrs'), 'pcrses');
    assert.strictEqual(singularize('pcrses'), 'pcrs');
  });
});
