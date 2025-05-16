import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'frontend/tests/test-support/mirage';
import { component } from 'frontend/tests/pages/components/school-curriculum-inventory-institution-manager';
import SchoolCurriculumInventoryInstitutionManager from 'frontend/components/school-curriculum-inventory-institution-manager';
import noop from 'ilios-common/helpers/noop';

module(
  'Integration | Component | school-curriculum-inventory-institution-manager',
  function (hooks) {
    setupRenderingTest(hooks);
    setupMirage(hooks);

    test('it renders', async function (assert) {
      const school = this.server.create('school');
      const institution = this.server.create('curriculum-inventory-institution', {
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
      const institutionModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-institution', institution.id);
      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('institution', institutionModel);
      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @institution={{this.institution}}
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
          />
        </template>,
      );

      assert.strictEqual(component.header.title, 'Curriculum Inventory Institutional Information');
      assert.ok(component.header.hasSaveButton);
      assert.strictEqual(component.content.name.label, 'School Name');
      assert.strictEqual(component.content.name.value, 'School of Rocket Surgery');
      assert.strictEqual(
        component.content.aamcCode.label,
        'AAMC School ID (e.g. "Institution ID")',
      );
      assert.strictEqual(component.content.aamcCode.value, '12345');
      assert.strictEqual(component.content.addressStreet.label, 'Street');
      assert.strictEqual(component.content.addressStreet.value, '123 Main Street');
      assert.strictEqual(component.content.addressCity.label, 'City');
      assert.strictEqual(component.content.addressCity.value, 'Browntown');
      assert.strictEqual(component.content.addressStateOrProvince.label, 'State or Province');
      assert.strictEqual(component.content.addressStateOrProvince.value, 'XY');
      assert.strictEqual(component.content.addressZipCode.label, 'ZIP Code');
      assert.strictEqual(component.content.addressZipCode.value, '99999');
      assert.strictEqual(component.content.addressCountryCode.label, 'Country Code');
      assert.strictEqual(component.content.addressCountryCode.value, 'US');
    });

    test('empty form if no institution exists', async function (assert) {
      const school = this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @institution={{this.school.curriculumInventoryInstitution}}
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
          />
        </template>,
      );

      assert.strictEqual(component.content.name.value, '');
      assert.strictEqual(component.content.aamcCode.value, '');
      assert.strictEqual(component.content.addressStreet.value, '');
      assert.strictEqual(component.content.addressCity.value, '');
      assert.strictEqual(component.content.addressStateOrProvince.value, '');
      assert.strictEqual(component.content.addressZipCode.value, '');
      assert.strictEqual(component.content.addressCountryCode.value, '');
    });

    test('cancel', async function (assert) {
      assert.expect(1);
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('manage', (isManaging) => {
        assert.false(isManaging);
      });
      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @institution={{this.school.curriculumInventoryInstitution}}
            @canUpdate={{this.canUpdate}}
            @manage={{this.manage}}
          />
        </template>,
      );
      await component.header.cancel();
    });

    test('save existing institution', async function (assert) {
      assert.expect(8);
      const school = this.server.create('school');
      const institution = this.server.create('curriculum-inventory-institution', {
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
      const institutionModel = await this.owner
        .lookup('service:store')
        .findRecord('curriculum-inventory-institution', institution.id);
      const newName = 'Rocket Surgery Academy';
      const newAamcCode = '11111';
      const newAddressStreet = 'Yellow Brick Road 1';
      const newAddressCity = 'Sunnyvale';
      const newAddressStateOrProvince = 'AB';
      const newAddressZipCode = '22222';
      const newAddressCountryCode = 'CA';

      this.set('school', schoolModel);
      this.set('institution', institutionModel);
      this.set('canUpdate', true);
      this.set('saveInstitution', (institution) => {
        assert.strictEqual(institution.get('name'), newName);
        assert.strictEqual(institution.get('aamcCode'), newAamcCode);
        assert.strictEqual(institution.get('addressStreet'), newAddressStreet);
        assert.strictEqual(institution.get('addressCity'), newAddressCity);
        assert.strictEqual(institution.get('addressStateOrProvince'), newAddressStateOrProvince);
        assert.strictEqual(institution.get('addressZipCode'), newAddressZipCode);
        assert.strictEqual(institution.get('addressCountryCode'), newAddressCountryCode);
        assert.strictEqual(institution.belongsTo('school').id(), schoolModel.get('id'));
      });
      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @institution={{this.institution}}
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
            @save={{this.saveInstitution}}
          />
        </template>,
      );

      component.content.name.change(newName);
      component.content.aamcCode.change(newAamcCode);
      component.content.addressStreet.change(newAddressStreet);
      component.content.addressCity.change(newAddressCity);
      component.content.addressStateOrProvince.change(newAddressStateOrProvince);
      component.content.addressZipCode.change(newAddressZipCode);
      component.content.addressCountryCode.change(newAddressCountryCode);

      await component.header.save();
    });

    test('save new institution', async function (assert) {
      assert.expect(8);
      const school = this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      const newName = 'Rocket Surgery Academy';
      const newAamcCode = '11111';
      const newAddressStreet = 'Yellow Brick Road 1';
      const newAddressCity = 'Chula Vista';
      const newAddressStateOrProvince = 'CA';
      const newAddressZipCode = '22222';
      const newAddressCountryCode = 'US';

      this.set('school', schoolModel);

      this.set('canUpdate', true);
      this.set('saveInstitution', (institution) => {
        assert.strictEqual(institution.get('name'), newName);
        assert.strictEqual(institution.get('aamcCode'), newAamcCode);
        assert.strictEqual(institution.get('addressStreet'), newAddressStreet);
        assert.strictEqual(institution.get('addressCity'), newAddressCity);
        assert.strictEqual(institution.get('addressStateOrProvince'), newAddressStateOrProvince);
        assert.strictEqual(institution.get('addressZipCode'), newAddressZipCode);
        assert.strictEqual(institution.get('addressCountryCode'), newAddressCountryCode);
        assert.notOk(institution.belongsTo('school').id());
      });
      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
            @save={{this.saveInstitution}}
          />
        </template>,
      );

      component.content.name.change(newName);
      component.content.aamcCode.change(newAamcCode);
      component.content.addressStreet.change(newAddressStreet);
      component.content.addressCity.change(newAddressCity);
      component.content.addressStateOrProvince.change(newAddressStateOrProvince);
      component.content.addressZipCode.change(newAddressZipCode);
      component.content.addressCountryCode.change(newAddressCountryCode);

      await component.header.save();
    });

    test('form validation', async function (assert) {
      const school = this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);

      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
          />
        </template>,
      );

      assert.notOk(component.content.name.hasError);
      assert.notOk(component.content.aamcCode.hasError);
      assert.notOk(component.content.addressStreet.hasError);
      assert.notOk(component.content.addressCity.hasError);
      assert.notOk(component.content.addressStateOrProvince.hasError);
      assert.notOk(component.content.addressZipCode.hasError);
      assert.notOk(component.content.addressCountryCode.hasError);

      await component.header.save();

      assert.ok(component.content.name.hasError);
      assert.strictEqual(
        component.content.name.error,
        'School Name is too short (minimum is 1 characters)',
      );
      assert.ok(component.content.aamcCode.hasError);
      assert.strictEqual(
        component.content.aamcCode.error,
        'AAMC School ID (e.g. "Institution ID") must be a number',
      );
      assert.ok(component.content.addressStreet.hasError);
      assert.strictEqual(
        component.content.addressStreet.error,
        'Street is too short (minimum is 1 characters)',
      );
      assert.ok(component.content.addressCity.hasError);
      assert.strictEqual(
        component.content.addressCity.error,
        'City is too short (minimum is 1 characters)',
      );
      assert.ok(component.content.addressStateOrProvince.hasError);
      assert.strictEqual(
        component.content.addressStateOrProvince.error,
        'State or Province is too short (minimum is 1 characters)',
      );
      assert.ok(component.content.addressZipCode.hasError);
      assert.strictEqual(
        component.content.addressZipCode.error,
        'ZIP Code is too short (minimum is 1 characters)',
      );
      assert.ok(component.content.addressCountryCode.hasError);
      assert.strictEqual(
        component.content.addressCountryCode.error,
        'Country Code is too short (minimum is 1 characters)',
      );

      await component.content.name.change('a'.repeat(101));
      assert.strictEqual(
        component.content.name.error,
        'School Name is too long (maximum is 100 characters)',
      );
      await component.content.name.change('aa');
      assert.notOk(component.content.name.hasError);

      await component.content.aamcCode.change('0');
      assert.strictEqual(
        component.content.aamcCode.error,
        'AAMC School ID (e.g. "Institution ID") must be greater than or equal to 1',
      );
      await component.content.aamcCode.change('1.5');
      assert.strictEqual(
        component.content.aamcCode.error,
        'AAMC School ID (e.g. "Institution ID") must be an integer',
      );
      await component.content.aamcCode.change('12345');
      assert.notOk(component.content.aamcCode.hasError);

      await component.content.addressStreet.change('a'.repeat(101));
      assert.strictEqual(
        component.content.addressStreet.error,
        'Street is too long (maximum is 100 characters)',
      );
      await component.content.addressStreet.change('123 main');
      assert.notOk(component.content.addressStreet.hasError);

      await component.content.addressCity.change('a'.repeat(101));
      assert.strictEqual(
        component.content.addressCity.error,
        'City is too long (maximum is 100 characters)',
      );
      await component.content.addressCity.change('Citytown');
      assert.notOk(component.content.addressCity.hasError);

      await component.content.addressStateOrProvince.change('a'.repeat(51));
      assert.strictEqual(
        component.content.addressStateOrProvince.error,
        'State or Province is too long (maximum is 50 characters)',
      );
      await component.content.addressStateOrProvince.change('Freestate');
      assert.notOk(component.content.addressStateOrProvince.hasError);

      await component.content.addressZipCode.change('a'.repeat(11));
      assert.strictEqual(
        component.content.addressZipCode.error,
        'ZIP Code is too long (maximum is 10 characters)',
      );
      await component.content.addressZipCode.change('12345');
      assert.notOk(component.content.addressZipCode.hasError);

      await component.content.addressCountryCode.change('XY');
      assert.notOk(component.content.addressCountryCode.hasError);
    });

    test('no save button in read-only mode', async function (assert) {
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').findRecord('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', false);

      await render(
        <template>
          <SchoolCurriculumInventoryInstitutionManager
            @institution={{this.school.curriculumInventoryInstitution}}
            @canUpdate={{this.canUpdate}}
            @manage={{(noop)}}
          />
        </template>,
      );
      assert.notOk(component.header.hasSaveButton);
    });
  },
);
