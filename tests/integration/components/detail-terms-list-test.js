import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  settled,
  find,
  click,
  findAll
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | detail terms list', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('list with terms', async function(assert) {
    assert.expect(4);
    const school = this.server.create('school', {
      title: 'Medicine'
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
    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');

    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);
    await render(hbs`<DetailTermsList
      @vocabulary={{vocabulary}}
      @terms={{terms}}
      @canEdit={{false}}
    />`);
    assert.dom('[data-test-title]').hasText('Topics (Medicine)');
    assert.dom('li').exists({ count: 2 });
    assert.dom('li').hasText('bar');
    assert.dom(findAll('li')[1]).hasText('foo');
  });

  test('empty list', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine'
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

    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');

    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);
    await render(hbs`<DetailTermsList
      @vocabulary={{vocabulary}}
      @terms={{terms}}
      @canEdit={{false}}
    />`);
    await settled();
    assert.dom('[data-test-title]').hasText('Topics (Medicine)');
    assert.dom('li').doesNotExist();
  });

  test('remove term', async function(assert) {
    assert.expect(2);
    const school = this.server.create('school', {
      title: 'Medicine'
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      school,
    });

    const term1 = this.server.create('term', {
      title: 'foo',
      vocabulary,
    });

    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    const terms = await this.owner.lookup('service:store').findAll('term');
    this.set('vocabulary', vocabularyModel);
    this.set('terms', terms);

    this.set('remove', val => {
      assert.equal(val.id, term1.id);
    });
    await render(hbs`<DetailTermsList
      @vocabulary={{vocabulary}}
      @terms={{terms}}
      @remove={{action remove}}
      @canEdit={{true}}
    />`);
    assert.dom('li:nth-of-type(1) .fa-times').exists({ count: 1 });
    await click(find('li'));
  });

  test('inactive vocabulary labeled as such in edit mode', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {
      title: 'Medicine'
    });

    const vocabulary = this.server.create('vocabulary', {
      title: 'Topics',
      active: false,
      school,
    });

    const vocabularyModel = await this.owner.lookup('service:store').find('vocabulary', vocabulary.id);
    this.set('vocabulary', vocabularyModel);
    this.set('terms', []);
    await render(hbs`<DetailTermsList
      @vocabulary={{vocabulary}}
      @terms={{terms}}
      @canEdit={{true}}
    />`);
    await settled();
    assert.dom('[data-test-title] .inactive').hasText('(inactive)');
  });
});
