import EmberObject from '@ember/object';
import Service from '@ember/service';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

module('Integration | Component | unassigned students summary', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    let primarySchool = EmberObject.create({
      id: 1,
      title: 'school 0',
    });
    let secondarySchool = EmberObject.create({
      id: 1,
      title: 'school 1',
    });
    let user = EmberObject.create({
      school: resolve(primarySchool),
      schools: resolve([primarySchool, secondarySchool])
    });
    let currentUserMock = Service.extend({
      model: resolve(user)
    });

    let storeMock = Service.extend({
      query(what, {filters}){
        assert.equal(filters.school, 1);
        assert.equal('user', what);
        return resolve([1, 2, 3, 4, 5]);
      }
    });

    this.owner.register('service:currentUser', currentUserMock);
    this.owner.register('service:store', storeMock);

    await render(hbs`{{unassigned-students-summary}}`);

    return settled().then(() => {
      assert.equal(this.$().text().trim().search(/Students Requiring Cohort Assignment/), 0);
      assert.notEqual(this.$().text().trim().search(/There are 5 students needing assignment to a cohort/), -1);

      let options = this.$('option');
      assert.equal(options.length, 2);
      assert.equal(options.eq(0).text().trim(), 'school 0');
      assert.equal(options.eq(1).text().trim(), 'school 1');

      assert.equal(this.$('button').length, 1);

      assert.ok(this.$('div').eq(0).hasClass('alert'));
    });
  });

  test('it renders empty', async function(assert) {
    let primarySchool = EmberObject.create({
      id: 1,
      title: 'school 0',
    });
    let user = EmberObject.create({
      school: resolve(primarySchool),
      schools: resolve([primarySchool])
    });
    let currentUserMock = Service.extend({
      model: resolve(user)
    });

    let storeMock = Service.extend({
      query(){
        return resolve([]);
      }
    });

    this.owner.register('service:currentUser', currentUserMock);
    this.owner.register('service:store', storeMock);

    await render(hbs`{{unassigned-students-summary}}`);

    return settled().then(() => {
      assert.equal(this.$().text().trim().search(/Students Requiring Cohort Assignment/), 0);
      assert.notEqual(this.$().text().trim().search(/There are 0 students needing assignment to a cohort/), -1);

      assert.notOk(this.$('div').eq(0).hasClass('alert'));
      assert.equal(this.$('button').length, 0);
    });
  });
});