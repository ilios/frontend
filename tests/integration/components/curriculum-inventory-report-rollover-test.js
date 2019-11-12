import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import {
  render,
  click,
  find,
  fillIn
} from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import queryString from 'query-string';

module('Integration | Component | curriculum inventory report rollover', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function(assert) {
    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);
    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportRollover @report={{report}} />`);

    const yearSelect = '.years select';
    const name = '.name input';
    const description  = '.description textarea';

    for (let i = 1; i <  4; i++){
      assert.dom(`${yearSelect} option:nth-of-type(${i})`).hasText(`${thisYear + i} - ${thisYear + 1 + i}`);
    }
    assert.dom(name).exists({ count: 1 });
    assert.equal(find(name).value.trim(), report.get('name'));
    assert.dom(description).exists({ count: 1 });
    assert.equal(find(description).value.trim(), report.get('description'));
  });

  test('rollover report', async function(assert) {
    assert.expect(6);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);

    this.server.post(`/api/curriculuminventoryreports/:id/rollover`, (scheme, { params, requestBody}) => {
      assert.ok('id' in params);
      assert.equal(params.id, report.id);
      const data = queryString.parse(requestBody);
      assert.equal(data.year, thisYear + 1);
      assert.equal(data.name, report.get('name'));
      assert.equal(data.description, report.get('description'));

      return {
        curriculumInventoryReports: [
          {
            id: 14
          }
        ]
      };
    });
    this.set('report', report);
    this.set('visit', (newReport) => {
      assert.equal(newReport.id, 14);
    });
    await render(hbs`<CurriculumInventoryReportRollover @report={{report}} @visit={{action visit}} />`);
    await click('.done');
  });

  test('rollover report with new name, description and year', async function(assert) {
    assert.expect(5);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    this.server.create('curriculum-inventory-report', {
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);
    const newName = 'new report';
    const newDescription = 'new description';
    const newYear = thisYear + 4;

    this.server.post(`/api/curriculuminventoryreports/:id/rollover`, (scheme, { params, requestBody}) => {
      assert.ok('id' in params);
      assert.equal(params.id, report.id);
      const data = queryString.parse(requestBody);
      assert.equal(data.name, newName, 'The new name gets passed.');
      assert.equal(data.description, newDescription, 'The new description gets passed.');
      assert.equal(data.year, newYear, 'The new year gets passed.');

      return {
        curriculumInventoryReports: [
          {
            id: 14
          }
        ]
      };
    });

    this.set('report', report);
    this.set('visit', () => {});

    await render(hbs`<CurriculumInventoryReportRollover @report={{report}} @visit={{action visit}} />`);

    const input = `.name input`;
    const textarea = `.description textarea`;
    const years = `.years select`;
    await fillIn(input, newName);
    await fillIn(textarea, newDescription);
    await fillIn(years, newYear);
    await click('.done');
  });

  test('no input validation errors are shown initially', async function(assert) {
    this.server.create('curriculum-inventory-report');
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);
    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportRollover @report={{report}} />`);
    assert.dom('.validation-error-message').doesNotExist();
  });

  test('input validation fails on blank reort name', async function(assert) {
    this.server.create('curriculum-inventory-report');
    const report = await this.owner.lookup('service:store').find('curriculum-inventory-report', 1);

    this.set('report', report);

    await render(hbs`<CurriculumInventoryReportRollover @report={{report}} />`);

    const name = '.name';
    const input = `${name} input`;
    await fillIn(input, '');
    assert.dom('.validation-error-message').exists({ count: 1 });
    assert.ok(find('.validation-error-message').textContent.includes('blank'));
  });

});
