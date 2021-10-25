import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | curriculum-inventory/leadership-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    const users = this.server.createList('user', 2);
    const report = this.server.create('curriculum-inventory-report', {
      administrators: users,
    });
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('report', reportModel);
    await render(hbs`<CurriculumInventory::LeadershipExpanded
      @report={{this.report}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    const title = '.title';
    const table = 'table';
    const administrators = `${table} tbody tr:nth-of-type(1) td:nth-of-type(1) li`;
    const firstAdministrator = `${administrators}:nth-of-type(1)`;
    const secondAdministrator = `${administrators}:nth-of-type(2)`;

    assert.dom(title).hasText('Curriculum Inventory Report Leadership');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(firstAdministrator).hasText('0 guy M. Mc0son');
    assert.dom(secondAdministrator).hasText('1 guy M. Mc1son');
  });

  test('clicking the header collapses', async function (assert) {
    assert.expect(1);
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('report', reportModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CurriculumInventory::LeadershipExpanded
      @report={{this.report}}
      @canUpdate={{true}}
      @collapse={{action click}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    const title = '.title';

    await click(title);
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('report', reportModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CurriculumInventory::LeadershipExpanded
      @report={{this.report}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{action click}}
    />`);
    const manage = '.actions button';

    await click(manage);
  });
});
