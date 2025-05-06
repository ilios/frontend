import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { render } from '@ember/test-helpers';
import sortByPosition from 'ilios-common/helpers/sort-by-position';
import { array } from '@ember/helper';

module('Integration | Helper | sort-by-position', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('sort objectives', async function (assert) {
    this.server.create('course-objective', {
      title: 'Aardvark',
      position: 3,
    });
    this.server.create('course-objective', {
      title: 'Zeppelin',
      position: 2,
    });
    this.server.create('course-objective', {
      title: 'Oscar',
      position: 1,
    });
    this.server.create('course-objective', {
      title: 'Bockwurst',
      position: 1,
    });
    const objectives = await this.owner.lookup('service:store').findAll('course-objective');
    this.set('objectives', objectives);
    await render(
      <template>
        {{#each (sortByPosition this.objectives) as |o|}}
          <span>{{o.title}}</span>
        {{/each}}
      </template>,
    );
    assert.dom('span').exists({ count: 4 });
    assert.dom('span:nth-of-type(1)').hasText('Bockwurst');
    assert.dom('span:nth-of-type(2)').hasText('Oscar');
    assert.dom('span:nth-of-type(3)').hasText('Zeppelin');
    assert.dom('span:nth-of-type(4)').hasText('Aardvark');
  });

  test('empty list', async function (assert) {
    this.set('emptyArrayMessage', 'Nada!');
    await render(
      <template>
        {{#each (sortByPosition (array)) as |o|}}
          <span>{{o.title}}</span>
        {{else}}
          <span>{{this.emptyArrayMessage}}</span>
        {{/each}}
      </template>,
    );
    assert.dom('span').exists({ count: 1 });
    assert.dom('span:nth-of-type(1)').hasText('Nada!');
  });

  test('null input', async function (assert) {
    this.set('emptyArrayMessage', 'Nada!');
    await render(
      <template>
        {{#each (sortByPosition null) as |o|}}
          <span>{{o.title}}</span>
        {{else}}
          <span>{{this.emptyArrayMessage}}</span>
        {{/each}}
      </template>,
    );
    assert.dom('span').exists({ count: 1 });
    assert.dom('span:nth-of-type(1)').hasText('Nada!');
  });
});
