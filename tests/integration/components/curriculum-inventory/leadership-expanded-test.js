import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/curriculum-inventory/leadership-expanded';

module('Integration | Component | curriculum-inventory/leadership-expanded', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const administrators = this.server.createList('user', 2);
    const report = this.server.create('curriculum-inventory-report', {
      administrators,
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
    assert.ok(component.collapse.text, 'Curriculum Inventory Report Leadership');
    assert.equal(component.leadershipList.administrators.length, 2);
    assert.equal(component.leadershipList.administrators[0].text, '0 guy M. Mc0son');
    assert.equal(component.leadershipList.administrators[1].text, '1 guy M. Mc1son');
  });

  test('clicking the header collapses', async function (assert) {
    assert.expect(1);
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('report', reportModel);
    this.set('collapse', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CurriculumInventory::LeadershipExpanded
      @report={{this.report}}
      @canUpdate={{true}}
      @collapse={{this.collapse}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{(noop)}}
    />`);
    await component.collapse.click();
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const report = this.server.create('curriculum-inventory-report');
    const reportModel = await this.owner
      .lookup('service:store')
      .find('curriculum-inventory-report', report.id);

    this.set('report', reportModel);
    this.set('manage', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CurriculumInventory::LeadershipExpanded
      @report={{this.report}}
      @canUpdate={{true}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @isManaging={{false}}
      @setIsManaging={{this.manage}}
    />`);
    await component.manage.click();
  });
});
