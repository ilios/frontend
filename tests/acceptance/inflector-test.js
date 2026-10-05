import { module, test } from 'qunit';
import { setupApplicationTest } from 'frontend/tests/helpers';
import { singularize, pluralize } from 'ember-inflector';

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
