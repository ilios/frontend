import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/program-year/competencies';
import Competencies from 'frontend/components/program-year/competencies';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | program-year/competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    const program = this.server.create('program', {
      school,
    });
    const programYear = this.server.create('program-year', { program });
    this.server.create('cohort', { programYear });
    const domain = this.server.create('competency', { school });
    this.server.createList('competency', 2, {
      parent: domain,
      school,
      programYears: [programYear],
    });
    const domain2 = this.server.create('competency', {
      school,
      programYears: [programYear],
    });
    this.server.createList('competency', 2, {
      school,
      parent: domain2,
    });
  });

  test('it renders', async function (assert) {
    const programYear = await this.owner.lookup('service:store').findRecord('program-year', 1);
    this.set('programYear', programYear);
    await render(
      <template>
        <Competencies
          @programYear={{this.programYear}}
          @canUpdate={{true}}
          @isManaging={{false}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
          @setIsManaging={{(noop)}}
        />
      </template>,
    );

    assert.strictEqual(component.title, 'Competencies (3)');
    assert.ok(component.canManage);
    assert.strictEqual(component.list.domains.length, 2);
    assert.strictEqual(component.list.domains[0].title, 'competency 0');
    assert.notOk(component.list.domains[0].isActive);
    assert.strictEqual(component.list.domains[0].competencies.length, 2);
    assert.strictEqual(component.list.domains[0].competencies[0].text, 'competency 1');
    assert.strictEqual(component.list.domains[0].competencies[1].text, 'competency 2');
    assert.strictEqual(component.list.domains[1].title, 'competency 3');
    assert.ok(component.list.domains[1].isActive);
    assert.strictEqual(component.list.domains[1].competencies.length, 0);
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const programYear = await this.owner.lookup('service:store').findRecord('program-year', 1);
    this.set('programYear', programYear);
    this.set('setIsManaging', (b) => {
      assert.true(b);
    });
    await render(
      <template>
        <Competencies
          @programYear={{this.programYear}}
          @canUpdate={{true}}
          @isManaging={{false}}
          @collapse={{(noop)}}
          @expand={{(noop)}}
          @setIsManaging={{this.setIsManaging}}
        />
      </template>,
    );

    await component.manage();
  });

  test('clicking collapse fires action', async function (assert) {
    assert.expect(1);
    const programYear = await this.owner.lookup('service:store').findRecord('program-year', 1);
    this.set('programYear', programYear);
    this.set('collapse', () => {
      assert.ok(true);
    });
    await render(
      <template>
        <Competencies
          @programYear={{this.programYear}}
          @canUpdate={{true}}
          @isManaging={{false}}
          @collapse={{this.collapse}}
          @expand={{(noop)}}
          @setIsManaging={{(noop)}}
        />
      </template>,
    );
    await component.clickTitle();
  });
});
