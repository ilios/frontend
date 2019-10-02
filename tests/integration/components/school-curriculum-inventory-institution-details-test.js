import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { component } from 'ilios/tests/pages/components/school-curriculum-inventory-institution-details';

module('Integration | Component | school-curriculum-inventory-institution-details', function(hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const school = this.server.create('school');
    this.server.create('curriculum-inventory-institution', {
      school,
      name: "School of Rocket Surgery",
      aamcCode: "12345",
      addressStreet: "123 Main Street",
      addressCity: "Browntown",
      addressStateOrProvince: "XY",
      addressZipCode: "99999",
      addressCountryCode: "US"
    });

    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('canUpdate', true);
    this.set('manage', parseInt);
    await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{school}}
      @canUpdate={{canUpdate}}
      @manage={{manage}}
    />`);

    assert.equal(component.header.title, "Curriculum Inventory Institutional Information");
    assert.equal(component.header.manageTitle, "Manage CIR Institutional Info");
    assert.equal(component.content.nameLabel, "School Name:");
    assert.equal(component.content.name, "School of Rocket Surgery");
    assert.equal(component.content.aamcCodeLabel, 'AAMC School ID (e.g. "Institution ID"):');
    assert.equal(component.content.aamcCode, "12345");
    assert.equal(component.content.addressStreetLabel, "Street:");
    assert.equal(component.content.addressStreet, "123 Main Street");
    assert.equal(component.content.addressCityLabel, "City:");
    assert.equal(component.content.addressCity, "Browntown");
    assert.equal(component.content.addressStateOrProvinceLabel, "State or Province:");
    assert.equal(component.content.addressStateOrProvince, "XY");
    assert.equal(component.content.addressZipCodeLabel, "ZIP Code:");
    assert.equal(component.content.addressZipCode, "99999");
    assert.equal(component.content.addressCountryCodeLabel, "Country:");
    assert.equal(component.content.addressCountryCode, "US");
  });

  test('no manage button in read-only mode', async function (assert) {
    const school = this.server.create('school');
    this.server.create('curriculum-inventory-institution', {
      school,
    });

    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('canUpdate', false);
    this.set('manage', parseInt);
    await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{school}}
      @canUpdate={{canUpdate}}
      @manage={{manage}}
    />`);
    assert.notOk(component.header.hasManageAction);
  });

  test('manage button fires', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    this.server.create('curriculum-inventory-institution', {
      school,
    });

    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('canUpdate', true);
    this.set('manage', (isManaging) => {
      assert.ok(isManaging);
    });
    await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{school}}
      @canUpdate={{canUpdate}}
      @manage={{manage}}
    />`);
    await component.header.manage();
  });

  test('no institutional information', async function (assert) {
    assert.expect(1);
    const school = this.server.create('school');
    const schoolModel = await this.owner.lookup('service:store').find('school', school.id);

    this.set('school', schoolModel);
    this.set('canUpdate', true);
    this.set('manage', parseInt);
    await render(hbs`<SchoolCurriculumInventoryInstitutionDetails
      @school={{school}}
      @canUpdate={{canUpdate}}
      @manage={{manage}}
    />`);
    await assert.equal(component.content.noInfo, "No institutional information has been configured for this school.");
  });
});
