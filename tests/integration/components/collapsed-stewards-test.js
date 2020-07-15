import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Integration | Component | collapsed stewards', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    assert.expect(5);
    const school1 = this.server.create('school', {
      title: 'school1'
    });
    const school2 = this.server.create('school', {
      title: 'school2'
    });
    const department1 = this.server.create('department', {
      school: school1
    });
    const department2 = this.server.create('department', {
      school: school1
    });
    const department3 = this.server.create('department', {
      school: school2
    });

    const programYear = this.server.create('program-year');
    this.server.create('program-year-steward', {
      programYear,
      school: school1,
      department: department1
    });

    this.server.create('program-year-steward', {
      programYear,
      school: school1,
      department: department2
    });

    this.server.create('program-year-steward', {
      programYear,
      school: school2,
      department: department3
    });

    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
    this.set('programYear', programYearModel);
    await render(hbs`<CollapsedStewards @programYear={{programYear}} @expand={{noop}} />`);

    const title = '.title';
    const table = 'table';
    const school1Row = `${table} tbody tr:nth-of-type(1)`;
    const school2Row = `${table} tbody tr:nth-of-type(2)`;
    const school1Title = `${school1Row} td:nth-of-type(1)`;
    const school2Title = `${school2Row} td:nth-of-type(1)`;
    const school1Departments = `${school1Row} td:nth-of-type(2)`;
    const school2Departments = `${school2Row} td:nth-of-type(2)`;

    await settled();
    assert.dom(title).hasText('Stewarding Schools and Departments (3)');
    assert.dom(school1Title).hasText('school1');
    assert.dom(school2Title).hasText('school2');
    assert.dom(school1Departments).hasText('2');
    assert.dom(school2Departments).hasText('1');
  });

  test('clicking the header expands the list', async function(assert) {
    assert.expect(1);
    const programYear = this.server.create('program-year');
    const programYearModel = await this.owner.lookup('service:store').find('program-year', programYear.id);
    this.set('programYear', programYearModel);

    this.set('click', () => {
      assert.ok(true, 'Action was fired');
    });
    await render(hbs`<CollapsedStewards @programYear={{programYear}} @expand={{action click}} />`);
    const title = '.title';

    await click(title);
  });
});
