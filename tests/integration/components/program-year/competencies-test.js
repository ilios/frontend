import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { component } from 'ilios/tests/pages/components/program-year/competencies';

module('Integration | Component | program-year/competencies', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    const school = this.server.create('school');
    this.server.create('program', {
      school,
    });
    this.server.create('programYear', {
      programId: 1,
    });
    this.server.create('cohort', {
      programYearId: 1,
    });
    this.server.create('competency', {
      school,
    });
    this.server.createList('competency', 2, {
      parentId: 1,
      school,
      programYearIds: [1],
    });
    this.server.create('competency', {
      school,
    });
    this.server.createList('competency', 2, {
      school,
      parentId: 4,
    });
  });

  test('it renders', async function (assert) {
    const programYear = await this.owner.lookup('service:store').find('program-year', 1);
    this.set('programYear', programYear);
    await render(hbs`<ProgramYear::Competencies
      @programYear={{this.programYear}}
      @canUpdate={{true}}
      @isManaging={{false}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @setIsManaging={{(noop)}}
    />`);

    assert.equal(component.title, 'Competencies (2)');
    assert.ok(component.canManage);
    assert.equal(component.list.domains.length, 1);
    assert.equal(component.list.domains[0].title, 'competency 0');
    assert.equal(component.list.domains[0].competencies.length, 2);
    assert.equal(component.list.domains[0].competencies[0].text, 'competency 1');
    assert.equal(component.list.domains[0].competencies[1].text, 'competency 2');
  });

  test('clicking manage fires action', async function (assert) {
    assert.expect(1);
    const programYear = await this.owner.lookup('service:store').find('program-year', 1);
    this.set('programYear', programYear);
    this.set('setIsManaging', (b) => {
      assert.true(b);
    });
    await render(hbs`<ProgramYear::Competencies
      @programYear={{this.programYear}}
      @canUpdate={{true}}
      @isManaging={{false}}
      @collapse={{(noop)}}
      @expand={{(noop)}}
      @setIsManaging={{this.setIsManaging}}
    />`);

    await component.manage();
  });

  test('clicking collapse fires action', async function (assert) {
    assert.expect(1);
    const programYear = await this.owner.lookup('service:store').find('program-year', 1);
    this.set('programYear', programYear);
    this.set('collapse', () => {
      assert.ok(true);
    });
    await render(hbs`<ProgramYear::Competencies
      @programYear={{this.programYear}}
      @canUpdate={{true}}
      @isManaging={{false}}
      @collapse={{this.collapse}}
      @expand={{(noop)}}
      @setIsManaging={{(noop)}}
    />`);
    await component.clickTitle();
  });
});
