import Service from '@ember/service';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory report rollover', function(hooks) {
  setupRenderingTest(hooks);


  test('it renders', async function(assert) {
    let storeMock = Service.extend({
      query(){
        return [];
      }
    });
    this.owner.register('service:store', storeMock);

    const thisYear = parseInt(moment().format('YYYY'), 10);
    let report = EmberObject.create({
      id: 1,
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);

    const yearSelect = '.years select';
    const name = '.name input';
    const description  = '.description textarea';

    return settled().then(()=>{
      for (let i = 0; i < 5; i++){
        assert.equal(this.$(`${yearSelect} option:eq(${i})`).text().trim(), `${thisYear + i} - ${thisYear + 1 + i}`);
      }
      assert.equal(this.$(name).length, 1);
      assert.equal(this.$(name).val().trim(), report.get('name'));
      assert.equal(this.$(description).length, 1);
      assert.equal(this.$(description).val().trim(), report.get('description'));
    });
  });

  test('rollover report', async function(assert) {
    assert.expect(12);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    let report = EmberObject.create({
      id: 1,
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });

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

    let storeMock = Service.extend({
      pushPayload(obj){
        assert.ok('curriculumInventoryReports' in obj);
        assert.ok(obj.curriculumInventoryReports.length, 1);
        assert.equal(obj.curriculumInventoryReports[0].id, 14);
      },
      peekRecord(what, id){
        assert.equal(what, 'curriculum-inventory-report');
        assert.equal(id, 14);

        return EmberObject.create({
          id: 14
        });
      },
      query(){
        return [];
      }
    });
    this.owner.register('service:store', storeMock);
    let flashmessagesMock = Service.extend({
      success(message){
        assert.equal(message, 'general.curriculumInventoryReportRolloverSuccess');
      }
    });
    this.owner.register('service:flashMessages', flashmessagesMock);


    this.set('report', report);
    this.set('visit', (newReport) => {
      assert.equal(newReport.id, 14);
    });
    await render(hbs`{{curriculum-inventory-report-rollover report=report visit=(action visit)}}`);

    await settled();
    await this.$('.done').click();
    await settled();
  });

  test('rollover report with new name, description and year', async function(assert) {
    assert.expect(7);
    const thisYear = parseInt(moment().format('YYYY'), 10);
    let report = EmberObject.create({
      id: 1,
      name: 'old report',
      description: 'this is an old report',
      year: thisYear
    });

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

    let storeMock = Service.extend({
      pushPayload(){},
      peekRecord(what, id){
        assert.equal(what, 'curriculum-inventory-report');
        assert.equal(id, 14);
        return EmberObject.create({
          id: 14
        });
      },
      query(){
        return [];
      }
    });
    this.owner.register('service:store', storeMock);
    let flashmessagesMock = Service.extend({
      success(){}
    });
    this.owner.register('service:flashMessages', flashmessagesMock);

    this.set('report', report);
    this.set('visit', () => {});

    await render(hbs`{{curriculum-inventory-report-rollover report=report visit=(action visit)}}`);

    await settled();
    const input = `.name input`;
    const textarea = `.description textarea`;
    const lastOption = `.years option:last`;
    this.$(input).val(newName);
    this.$(input).trigger('input');
    this.$(textarea).val(newDescription);
    this.$(textarea).trigger('input');
    this.$(lastOption).prop('selected', true);
    this.$(lastOption).trigger('change');
    await this.$('.done').click();
    await settled();
  });

  test('no input validation errors are shown initially', async function(assert) {
    let storeMock = Service.extend({
      query(){
        return [];
      }
    });
    this.owner.register('service:store', storeMock);
    let report = EmberObject.create({
      id: 1,
    });
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);

    return settled().then(() => {
      assert.equal(this.$('.message').length, 0);
    });
  });

  test('input validation fails on blank reort name', async function(assert) {
    let storeMock = Service.extend({
      query(){
        return [];
      }
    });
    this.owner.register('service:store', storeMock);
    let report = EmberObject.create({
      id: 1,
      name: 'report name',
    });
    this.set('report', report);

    await render(hbs`{{curriculum-inventory-report-rollover report=report}}`);

    const name = '.name';
    const input = `${name} input`;
    this.$(input).val('');
    this.$(input).trigger('input');
    assert.ok(this.$(name).text().search(/blank/) > -1);

    return settled();
  });
});
