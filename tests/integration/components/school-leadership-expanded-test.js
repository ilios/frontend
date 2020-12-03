import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | school leadership expanded', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(6);
    const user1 = this.server.create('user');
    const user2 = this.server.create('user');

    const school = this.server.create('school', {
      directors: [user1],
      administrators: [user1, user2],
    });

    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolLeadershipExpanded
      @school={{school}}
      @canUpdate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @isManaging={{false}}
      @setIsManaging={{noop}}
    />`);
    const title = '.title';
    const table = 'table';
    const directors = `${table} tbody tr:nth-of-type(1) td:nth-of-type(1) li`;
    const firstDirector = `${directors}:nth-of-type(1)`;
    const administrators = `${table} tbody tr:nth-of-type(1) td:nth-of-type(2) li`;
    const firstAdministrator = `${administrators}:nth-of-type(1)`;
    const secondAdministrator = `${administrators}:nth-of-type(2)`;

    assert.dom(title).hasText('School Leadership');
    assert.dom(directors).exists({ count: 1 });
    assert.dom(firstDirector).hasText('0 guy M. Mc0son');
    assert.dom(administrators).exists({ count: 2 });
    assert.dom(firstAdministrator).hasText('0 guy M. Mc0son');
    assert.dom(secondAdministrator).hasText('1 guy M. Mc1son');
  });

  test('clicking the header collapses', async function(assert) {
    assert.expect(1);

    const school = this.server.create('school', {});
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SchoolLeadershipExpanded
      @school={{school}}
      @canUpdate={{true}}
      @collapse={{action click}}
      @expand={{noop}}
      @isManaging={{false}}
      @setIsManaging={{noop}}
    />`);
    const title = '.title';

    await click(title);
  });

  test('clicking manage fires action', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school', {});
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<SchoolLeadershipExpanded
      @school={{school}}
      @canUpdate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @isManaging={{false}}
      @setIsManaging={{action click}}
    />`);
    const manage = '.actions button';

    await click(manage);
  });

  // @link https://github.com/ilios/frontend/issues/5732
  test('managing mode', async function(assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);
    this.set('school', schoolModel);
    await render(hbs`<SchoolLeadershipExpanded
      @school={{this.school}}
      @canUpdate={{true}}
      @collapse={{noop}}
      @expand={{noop}}
      @isManaging={{true}}
      @setIsManaging={{noop}}
    />`);

    assert.dom('[data-test-leadership-manager]').exists();
    // @todo flesh this out when octanifying component under test [ST 2020/12/02].
  });
});
