import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-curriculum-inventory-institution-manager';

module(
  'Integration | Component | school-curriculum-inventory-institution-manager',
  function (hooks) {
    setupRenderingTest(hooks);
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

      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
    />`);

      assert.equal(component.header.title, 'Curriculum Inventory Institutional Information');
      assert.ok(component.header.hasSaveButton);
      assert.equal(component.content.name.label, 'School Name');
      assert.equal(component.content.name.value, 'School of Rocket Surgery');
      assert.equal(component.content.aamcCode.label, 'AAMC School ID (e.g. "Institution ID")');
      assert.equal(component.content.aamcCode.value, '12345');
      assert.equal(component.content.addressStreet.label, 'Street');
      assert.equal(component.content.addressStreet.value, '123 Main Street');
      assert.equal(component.content.addressCity.label, 'City');
      assert.equal(component.content.addressCity.value, 'Browntown');
      assert.equal(component.content.addressStateOrProvince.label, 'State or Province');
      assert.equal(component.content.addressStateOrProvince.value, 'XY');
      assert.equal(component.content.addressZipCode.label, 'ZIP Code');
      assert.equal(component.content.addressZipCode.value, '99999');
      assert.equal(component.content.addressCountryCode.label, 'Country');
      assert.equal(component.content.addressCountryCode.value, 'US');
    });

    test('empty form if no institution exists', async function (assert) {
      const school = this.server.create('school');
      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
    />`);

      assert.equal(component.content.name.value, '');
      assert.equal(component.content.aamcCode.value, '');
      assert.equal(component.content.addressStreet.value, '');
      assert.equal(component.content.addressCity.value, '');
      assert.equal(component.content.addressStateOrProvince.value, '');
      assert.equal(component.content.addressZipCode.value, '');
      assert.equal(component.content.addressCountryCode.value, '');
    });

    test('cancel', async function (assert) {
      assert.expect(1);
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('manage', (isManaging) => {
        assert.false(isManaging);
      });
      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{canUpdate}}
      @manage={{manage}}
    />`);
      await component.header.cancel();
    });

    test('save existing institution', async function (assert) {
      assert.expect(8);
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

      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      const newName = 'Rocket Surgery Academy';
      const newAamcCode = '11111';
      const newAddressStreet = 'Yellow Brick Road 1';
      const newAddressCity = 'Sunnyvale';
      const newAddressStateOrProvince = 'AB';
      const newAddressZipCode = '22222';
      const newAddressCountryCode = 'CA';

      this.set('school', schoolModel);
      this.set('canUpdate', true);
      this.set('saveInstitution', (institution) => {
        assert.equal(institution.get('name'), newName);
        assert.equal(institution.get('aamcCode'), newAamcCode);
        assert.equal(institution.get('addressStreet'), newAddressStreet);
        assert.equal(institution.get('addressCity'), newAddressCity);
        assert.equal(institution.get('addressStateOrProvince'), newAddressStateOrProvince);
        assert.equal(institution.get('addressZipCode'), newAddressZipCode);
        assert.equal(institution.get('addressCountryCode'), newAddressCountryCode);
        assert.equal(institution.belongsTo('school').id(), schoolModel.get('id'));
      });
      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
      @save={{this.saveInstitution}}
    />`);

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
      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

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
        assert.equal(institution.get('name'), newName);
        assert.equal(institution.get('aamcCode'), newAamcCode);
        assert.equal(institution.get('addressStreet'), newAddressStreet);
        assert.equal(institution.get('addressCity'), newAddressCity);
        assert.equal(institution.get('addressStateOrProvince'), newAddressStateOrProvince);
        assert.equal(institution.get('addressZipCode'), newAddressZipCode);
        assert.equal(institution.get('addressCountryCode'), newAddressCountryCode);
        assert.notOk(institution.belongsTo('school').id());
      });
      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
      @save={{this.saveInstitution}}
    />`);

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
      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', true);

      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
    />`);

      assert.notOk(component.content.name.hasError);
      assert.notOk(component.content.aamcCode.hasError);
      assert.notOk(component.content.addressStreet.hasError);
      assert.notOk(component.content.addressCity.hasError);
      assert.notOk(component.content.addressStateOrProvince.hasError);
      assert.notOk(component.content.addressZipCode.hasError);
      assert.notOk(component.content.addressCountryCode.hasError);

      await component.header.save();

      assert.ok(component.content.name.hasError);
      assert.equal(component.content.name.errorMessage, 'This field can not be blank');
      assert.ok(component.content.aamcCode.hasError);
      assert.equal(
        component.content.aamcCode.errorMessage,
        'This field must be greater than or equal to 1'
      );
      assert.ok(component.content.addressStreet.hasError);
      assert.equal(component.content.addressStreet.errorMessage, 'This field can not be blank');
      assert.ok(component.content.addressCity.hasError);
      assert.equal(component.content.addressCity.errorMessage, 'This field can not be blank');
      assert.ok(component.content.addressStateOrProvince.hasError);
      assert.equal(
        component.content.addressStateOrProvince.errorMessage,
        'This field can not be blank'
      );
      assert.ok(component.content.addressZipCode.hasError);
      assert.equal(component.content.addressZipCode.errorMessage, 'This field can not be blank');
      assert.ok(component.content.addressCountryCode.hasError);
      assert.equal(
        component.content.addressCountryCode.errorMessage,
        'This field can not be blank'
      );
    });

    test('no save button in read-only mode', async function (assert) {
      const school = this.server.create('school');
      this.server.create('curriculum-inventory-institution', {
        school,
      });

      const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

      this.set('school', schoolModel);
      this.set('canUpdate', false);

      await render(hbs`<SchoolCurriculumInventoryInstitutionManager
      @institution={{await this.school.curriculumInventoryInstitution}}
      @canUpdate={{this.canUpdate}}
      @manage={{(noop)}}
    />`);
      assert.notOk(component.header.hasSaveButton);
    });
  }
);
