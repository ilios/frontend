import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | leadership collapsed', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  test('it renders', async function (assert) {
    assert.expect(3);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`<LeadershipCollapsed
      @title={{this.title}}
      @directorsCount={{this.directorsCount}}
      @administratorsCount={{this.administratorsCount}}
      @expand={{this.click}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
    />
`);
    const title = '.title';
    const table = 'table';
    const directorsRow = `${table} tbody tr:nth-of-type(1)`;
    const administratorsRow = `${table} tbody tr:nth-of-type(2)`;
    const directors = `${directorsRow} td:nth-of-type(2)`;
    const administrators = `${administratorsRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Test Title');
    assert.dom(directors).hasText('There are 3 directors');
    assert.dom(administrators).hasText('There is 1 administrator');
  });

  test('clicking the header expands the list', async function (assert) {
    assert.expect(1);

    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<LeadershipCollapsed
      @directorsCount={{0}}
      @administratorsCount={{0}}
      @expand={{this.click}}
      @showAdministrators={{true}}
      @showDirectors={{true}}
    />
`);
    const title = '.title';

    await click(title);
  });

  test('it renders without directors', async function (assert) {
    assert.expect(2);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`<LeadershipCollapsed
      @title={{this.title}}
      @showDirectors={{false}}
      @showAdministrators={{true}}
      @directorsCount={{this.directorsCount}}
      @administratorsCount={{this.administratorsCount}}
      @expand={{this.click}}
    />
`);
    const title = '.title';
    const table = 'table';
    const administratorsRow = `${table} tbody tr:nth-of-type(1)`;
    const administrators = `${administratorsRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Test Title');
    assert.dom(administrators).hasText('There is 1 administrator');
  });

  test('it renders without administrators', async function (assert) {
    assert.expect(2);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`<LeadershipCollapsed
      @title={{this.title}}
      @showAdministrators={{false}}
      @showDirectors={{true}}
      @directorsCount={{this.directorsCount}}
      @administratorsCount={{this.administratorsCount}}
      @expand={{this.click}}
    />
`);
    const title = '.title';
    const table = 'table';
    const directorsRow = `${table} tbody tr:nth-of-type(1)`;
    const directors = `${directorsRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Test Title');
    assert.dom(directors).hasText('There are 3 directors');
  });
});
