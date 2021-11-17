import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios-common/page-objects/components/detail-terms-list';

module('Integration | Component | detail terms list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('list with terms', async function (assert) {
    assert.expect(5);
    const school = this.server.create('school', {
      title: 'Medicine',
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      school,
    });

    const vocabulary2 = this.server.create('vocabulary', {
      title: 'Something else',
      school,
    });

    this.server.create('term', {
      title: 'foo',
      vocabulary,
    });
    this.server.create('term', {
      title: 'bar',
      vocabulary,
    });
    this.server.create('term', {
      title: 'baz',
      vocabulary: vocabulary2,
    });
    this.server.create('term', {
      title: 'bat',
      vocabulary: vocabulary2,
    });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');

    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);
    await render(hbs`<DetailTermsList
      @vocabulary={{this.vocabulary}}
      @terms={{this.terms}}
      @canEdit={{false}}
    />`);
    assert.strictEqual(component.title, 'Topics (Medicine)');
    assert.strictEqual(component.vocabularyName, 'Topics');
    assert.strictEqual(component.terms.length, 2);
    assert.strictEqual(component.terms[0].name, 'bar');
    assert.strictEqual(component.terms[1].name, 'foo');
  });

  test('empty list', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine',
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      school,
    });

    const vocabulary2 = this.server.create('vocabulary', {
      title: 'Something else',
      school,
    });

    this.server.create('term', {
      title: 'foo',
      vocabulary: vocabulary2,
    });
    this.server.create('term', {
      title: 'bar',
      vocabulary: vocabulary2,
    });
    this.server.create('term', {
      title: 'baz',
      vocabulary: vocabulary2,
    });
    this.server.create('term', {
      title: 'bat',
      vocabulary: vocabulary2,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');

    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);
    await render(hbs`<DetailTermsList
      @vocabulary={{this.vocabulary}}
      @terms={{this.terms}}
      @canEdit={{false}}
    />`);
    assert.strictEqual(component.title, 'Topics (Medicine)');
    assert.strictEqual(component.terms.length, 0);
  });

  test('remove term', async function (assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine',
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      school,
    });

    const term1 = this.server.create('term', {
      title: 'foo',
      vocabulary,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');
    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);

    this.set('remove', (val) => {
      assert.strictEqual(val.id, term1.id);
    });
    await render(hbs`<DetailTermsList
      @vocabulary={{this.vocabulary}}
      @terms={{this.terms}}
      @remove={{this.remove}}
      @canEdit={{true}}
    />`);
    assert.ok(component.terms[0].hasDeleteIcon);
    await component.terms[0].remove();
  });

  test('inactive vocabulary labeled as such in edit mode', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school', {
      title: 'Medicine',
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      active: false,
      school,
    });

    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    this.set('vocabulary', vocabularyModel);
    this.set('terms', []);
    await render(hbs`<DetailTermsList
      @vocabulary={{this.vocabulary}}
      @terms={{this.terms}}
      @canEdit={{true}}
    />`);
    assert.dom('[data-test-title] .inactive').hasText('(inactive)');
  });

  test('click vocabulary title to manage', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const vocabulary = this.server.create('vocabulary', { school });
    this.server.create('term', { vocabulary });
    const vocabularyModel = await this.owner
      .lookup('service:store')
      .find('vocabulary', vocabulary.id);
    this.set('vocabulary', vocabularyModel);
    this.set('terms', []);
    this.set('manage', (vocabulary) => {
      assert.strictEqual(vocabulary, vocabularyModel);
    });
    await render(hbs`<DetailTermsList
      @vocabulary={{this.vocabulary}}
      @terms={{this.terms}}
      @canEdit={{true}}
      @manage={{this.manage}}
      @canManage={{true}}
    />`);
    await component.manage();
  });
});
