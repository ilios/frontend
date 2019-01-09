import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | leadership collapsed', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    assert.expect(3);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`{{leadership-collapsed
      title=title
      directorsCount=directorsCount
      administratorsCount=administratorsCount
      expand=(action click)
    }}`);
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

  test('clicking the header expands the list', async function(assert) {
    assert.expect(1);

    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`{{leadership-collapsed
      directorsCount=0
      administratorsCount=0
      expand=(action click)
    }}`);
    const title = '.title';

    await click(title);
  });

  test('it renders without directors', async function(assert) {
    assert.expect(2);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`{{leadership-collapsed
      title=title
      showDirectors=false
      directorsCount=directorsCount
      administratorsCount=administratorsCount
      expand=(action click)
    }}`);
    const title = '.title';
    const table = 'table';
    const administratorsRow = `${table} tbody tr:nth-of-type(1)`;
    const administrators = `${administratorsRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Test Title');
    assert.dom(administrators).hasText('There is 1 administrator');
  });

  test('it renders without administrators', async function(assert) {
    assert.expect(2);

    this.set('title', 'Test Title');
    this.set('directorsCount', 3);
    this.set('administratorsCount', 1);
    this.set('click', () => {});
    await render(hbs`{{leadership-collapsed
      title=title
      showAdministrators=false
      directorsCount=directorsCount
      administratorsCount=administratorsCount
      expand=(action click)
    }}`);
    const title = '.title';
    const table = 'table';
    const directorsRow = `${table} tbody tr:nth-of-type(1)`;
    const directors = `${directorsRow} td:nth-of-type(2)`;

    assert.dom(title).hasText('Test Title');
    assert.dom(directors).hasText('There are 3 directors');
  });
});
