import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Institutional Information', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });
  });

  test('create new institutional information', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.text,
      'No institutional information has been configured for this school.',
    );

    await page.manager.schoolInstitutionalInformationDetails.header.manage();
    assert.strictEqual(page.manager.schoolInstitutionalInformationManager.content.name.value, '');
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.aamcCode.value,
      '',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressStreet.value,
      '',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressCity.value,
      '',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressStateOrProvince.value,
      '',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressZipCode.value,
      '',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressCountryCode.value,
      '',
    );

    await page.manager.schoolInstitutionalInformationManager.content.name.change(
      'Rocket Surgery Academy',
    );
    await page.manager.schoolInstitutionalInformationManager.content.aamcCode.change('11111');
    await page.manager.schoolInstitutionalInformationManager.content.addressStreet.change(
      'Yellow Brick Road 1',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressCity.change(
      'Sunnyvale',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressStateOrProvince.change(
      'AB',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressZipCode.change('22222');
    await page.manager.schoolInstitutionalInformationManager.content.addressCountryCode.change(
      'CA',
    );
    await page.manager.schoolInstitutionalInformationManager.header.save();

    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.name,
      'Rocket Surgery Academy',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.aamcCode,
      '11111',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStreet,
      'Yellow Brick Road 1',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCity,
      'Sunnyvale',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStateOrProvince,
      'AB',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressZipCode,
      '22222',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCountryCode,
      'CA',
    );
  });

  test('update institutional information', async function (assert) {
    this.server.create('curriculum-inventory-institution', {
      school: this.school,
      name: 'School of Rocket Surgery',
      aamcCode: '12345',
      addressStreet: '123 Main Street',
      addressCity: 'Browntown',
      addressStateOrProvince: 'XY',
      addressZipCode: '99999',
      addressCountryCode: 'US',
    });
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.name,
      'School of Rocket Surgery',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.aamcCode,
      '12345',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStreet,
      '123 Main Street',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCity,
      'Browntown',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStateOrProvince,
      'XY',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressZipCode,
      '99999',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCountryCode,
      'US',
    );

    await page.manager.schoolInstitutionalInformationDetails.header.manage();
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.name.value,
      'School of Rocket Surgery',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.aamcCode.value,
      '12345',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressStreet.value,
      '123 Main Street',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressCity.value,
      'Browntown',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressStateOrProvince.value,
      'XY',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressZipCode.value,
      '99999',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationManager.content.addressCountryCode.value,
      'US',
    );

    await page.manager.schoolInstitutionalInformationManager.content.name.change(
      'Rocket Surgery Academy',
    );
    await page.manager.schoolInstitutionalInformationManager.content.aamcCode.change('11111');
    await page.manager.schoolInstitutionalInformationManager.content.addressStreet.change(
      'Yellow Brick Road 1',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressCity.change(
      'Sunnyvale',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressStateOrProvince.change(
      'AB',
    );
    await page.manager.schoolInstitutionalInformationManager.content.addressZipCode.change('22222');
    await page.manager.schoolInstitutionalInformationManager.content.addressCountryCode.change(
      'CA',
    );
    await page.manager.schoolInstitutionalInformationManager.header.save();

    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.name,
      'Rocket Surgery Academy',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.aamcCode,
      '11111',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStreet,
      'Yellow Brick Road 1',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCity,
      'Sunnyvale',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressStateOrProvince,
      'AB',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressZipCode,
      '22222',
    );
    assert.strictEqual(
      page.manager.schoolInstitutionalInformationDetails.content.addressCountryCode,
      'CA',
    );
  });
});
