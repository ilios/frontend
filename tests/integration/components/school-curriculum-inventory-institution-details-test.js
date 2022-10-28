import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-curriculum-inventory-institution-details';

module(
  'Integration | Component | school-curriculum-inventory-institution-details',
  function (hooks) {
    setupRenderingTest(hooks);
    setupIntl(hooks, 'en-us');
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
        name: 'School of Rocket Surgery',
        aamcCode: '12345',
        addressStreet: '123 Main Street',
        addressCity: 'Browntown',
        addressStateOrProvince: 'XY',
        addressZipCode: '99999',
        addressCountryCode: 'US',
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('manage', parseInt);
      await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{this.school}}
      @canUpdate={{this.canUpdate}}
      @manage={{this.manage}}
    />`);

      assert.strictEqual(component.header.title, 'Curriculum Inventory Institutional Information');
      assert.strictEqual(component.header.manageTitle, 'Manage CIR Institutional Info');
      assert.strictEqual(component.content.nameLabel, 'School Name:');
      assert.strictEqual(component.content.name, 'School of Rocket Surgery');
      assert.strictEqual(
        component.content.aamcCodeLabel,
        'AAMC School ID (e.g. "Institution ID"):'
      );
      assert.strictEqual(component.content.aamcCode, '12345');
      assert.strictEqual(component.content.addressStreetLabel, 'Street:');
      assert.strictEqual(component.content.addressStreet, '123 Main Street');
      assert.strictEqual(component.content.addressCityLabel, 'City:');
      assert.strictEqual(component.content.addressCity, 'Browntown');
      assert.strictEqual(component.content.addressStateOrProvinceLabel, 'State or Province:');
      assert.strictEqual(component.content.addressStateOrProvince, 'XY');
      assert.strictEqual(component.content.addressZipCodeLabel, 'ZIP Code:');
      assert.strictEqual(component.content.addressZipCode, '99999');
      assert.strictEqual(component.content.addressCountryCodeLabel, 'Country:');
      assert.strictEqual(component.content.addressCountryCode, 'US');
    });

    test('no manage button in read-only mode', async function (assert) {
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', false);
      this.set('manage', parseInt);
      await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{this.school}}
      @canUpdate={{this.canUpdate}}
      @manage={{this.manage}}
    />`);
      assert.notOk(component.header.hasManageAction);
    });

    test('manage button fires', async function (assert) {
      assert.expect(1);
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('manage', (isManaging) => {
        assert.ok(isManaging);
      });
      await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{this.school}}
      @canUpdate={{this.canUpdate}}
      @manage={{this.manage}}
    />`);
      await component.header.manage();
    });

    test('no institutional information', async function (assert) {
      assert.expect(1);
      const school = this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('manage', parseInt);
      await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{this.school}}
      @canUpdate={{this.canUpdate}}
      @manage={{this.manage}}
    />`);
      await assert.strictEqual(
        component.content.noInfo,
        'No institutional information has been configured for this school.'
      );
    });
  }
);
