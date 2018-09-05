import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
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
    const directorsRow = `${table} tbody tr:eq(0)`;
    const administratorsRow = `${table} tbody tr:eq(1)`;
    const directors = `${directorsRow} td:eq(1)`;
    const administrators = `${administratorsRow} td:eq(1)`;

    assert.equal(this.$(title).text().trim(), 'Test Title');
    assert.equal(this.$(directors).text().trim(), 'There are 3 directors');
    assert.equal(this.$(administrators).text().trim(), 'There is 1 administrator');
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

    this.$(title).click();
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
    const administratorsRow = `${table} tbody tr:eq(0)`;
    const administrators = `${administratorsRow} td:eq(1)`;

    assert.equal(this.$(title).text().trim(), 'Test Title');
    assert.equal(this.$(administrators).text().trim(), 'There is 1 administrator');
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
    const directorsRow = `${table} tbody tr:eq(0)`;
    const directors = `${directorsRow} td:eq(1)`;

    assert.equal(this.$(title).text().trim(), 'Test Title');
    assert.equal(this.$(directors).text().trim(), 'There are 3 directors');
  });
});
