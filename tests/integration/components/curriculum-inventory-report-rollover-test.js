import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find, findAll, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { run } from '@ember/runloop';
import { resolve } from 'rsvp';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);

    const yearSelect = '.years select';
    const name = '.name input';
    const description  = '.description textarea';

    for (let i = 0; i < 5; i++){
      assert.equal(find(`${yearSelect} option:nth-of-type(${i+1})`).textContent.trim(), `${thisYear + i} - ${thisYear + 1 + i}`);
    }
    assert.equal(findAll(name).length, 1);
    assert.equal(find(name).value.trim(), report.get('name'));
    assert.equal(findAll(description).length, 1);
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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));

    let ajaxMock = Service.extend({
      request(url, {method, data}){
        assert.equal(url.trim(), `/api/curriculuminventoryreports/${report.get('id')}/rollover`);
        assert.equal(method, 'POST');
        assert.equal(data.year, thisYear + 1);
        assert.equal(data.name, report.get('name'));
        assert.equal(data.description, report.get('description'));

        return resolve({
          curriculumInventoryReports: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);
    this.set('report', report);
    this.set('visit', (newReport) => {
      assert.equal(newReport.id, 14);
    });
    await render(hbs`{{curriculum-inventory-report-rollover report=report visit=(action visit)}}`);
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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    const newName = 'new report';
    const newDescription = 'new description';
    const newYear = thisYear + 4;

    let ajaxMock = Service.extend({
      request(url, {method, data}){
        assert.equal(url.trim(), `/api/curriculuminventoryreports/${report.get('id')}/rollover`);
        assert.equal(method, 'POST');
        assert.equal(data.name, newName, 'The new name gets passed.');
        assert.equal(data.description, newDescription, 'The new description gets passed.');
        assert.equal(data.year, newYear, 'The new year gets passed.');
        return resolve({
          curriculumInventoryReports: [
            {
              id: 14
            }
          ]
        });
      }
    });
    this.owner.register('service:commonAjax', ajaxMock);

    this.set('report', report);
    this.set('visit', () => {});

    await render(hbs`{{curriculum-inventory-report-rollover report=report visit=(action visit)}}`);

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
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);
    assert.equal(findAll('.validation-error-message').length, 0);
  });

  test('input validation fails on blank reort name', async function(assert) {
    this.server.create('curriculum-inventory-report');
    const report = run(() => this.owner.lookup('service:store').find('curriculum-inventory-report', 1));

    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);

    const name = '.name';
    const input = `${name} input`;
    await fillIn(input, '');
    assert.equal(findAll('.validation-error-message').length, 1);
    assert.ok(find('.validation-error-message').textContent.includes('blank'));
  });
});
