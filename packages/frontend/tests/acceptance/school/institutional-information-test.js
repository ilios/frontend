import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest } from 'frontend/tests/helpers';
import page from 'frontend/tests/pages/school';

module('Acceptance | School - Institutional Information', function (hooks) {
  setupApplicationTest(hooks);

  hooks.beforeEach(async function () {
    this.school = await this.server.create('school');
    await setupAuthentication({ administeredSchools: [this.school] });
  });

  test('create new institutional information', async function (assert) {
    await page.visit({ schoolId: this.school.id });
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.text,
      'No institutional information has been configured for this school.',
    );

    await page.root.institutionalInformationDetails.header.manage();
    assert.strictEqual(page.root.institutionalInformationManager.content.name.value, '');
    assert.strictEqual(page.root.institutionalInformationManager.content.aamcCode.value, '');
    assert.strictEqual(page.root.institutionalInformationManager.content.addressStreet.value, '');
    assert.strictEqual(page.root.institutionalInformationManager.content.addressCity.value, '');
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressStateOrProvince.value,
      '',
    );
    assert.strictEqual(page.root.institutionalInformationManager.content.addressZipCode.value, '');
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressCountryCode.value,
      '',
    );

    await page.root.institutionalInformationManager.content.name.change('Rocket Surgery Academy');
    await page.root.institutionalInformationManager.content.aamcCode.change('11111');
    await page.root.institutionalInformationManager.content.addressStreet.change(
      'Yellow Brick Road 1',
    );
    await page.root.institutionalInformationManager.content.addressCity.change('Sunnyvale');
    await page.root.institutionalInformationManager.content.addressStateOrProvince.change('AB');
    await page.root.institutionalInformationManager.content.addressZipCode.change('22222');
    await page.root.institutionalInformationManager.content.addressCountryCode.change('CA');
    await page.root.institutionalInformationManager.header.save();

    assert.strictEqual(
      page.root.institutionalInformationDetails.content.name,
      'Rocket Surgery Academy',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.aamcCode, '11111');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStreet,
      'Yellow Brick Road 1',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCity, 'Sunnyvale');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStateOrProvince,
      'AB',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressZipCode, '22222');
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCountryCode, 'CA');
  });

  test('update institutional information', async function (assert) {
    await this.server.create('curriculum-inventory-institution', {
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
      page.root.institutionalInformationDetails.content.name,
      'School of Rocket Surgery',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.aamcCode, '12345');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStreet,
      '123 Main Street',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCity, 'Browntown');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStateOrProvince,
      'XY',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressZipCode, '99999');
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCountryCode, 'US');

    await page.root.institutionalInformationDetails.header.manage();
    assert.strictEqual(
      page.root.institutionalInformationManager.content.name.value,
      'School of Rocket Surgery',
    );
    assert.strictEqual(page.root.institutionalInformationManager.content.aamcCode.value, '12345');
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressStreet.value,
      '123 Main Street',
    );
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressCity.value,
      'Browntown',
    );
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressStateOrProvince.value,
      'XY',
    );
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressZipCode.value,
      '99999',
    );
    assert.strictEqual(
      page.root.institutionalInformationManager.content.addressCountryCode.value,
      'US',
    );

    await page.root.institutionalInformationManager.content.name.change('Rocket Surgery Academy');
    await page.root.institutionalInformationManager.content.aamcCode.change('11111');
    await page.root.institutionalInformationManager.content.addressStreet.change(
      'Yellow Brick Road 1',
    );
    await page.root.institutionalInformationManager.content.addressCity.change('Sunnyvale');
    await page.root.institutionalInformationManager.content.addressStateOrProvince.change('AB');
    await page.root.institutionalInformationManager.content.addressZipCode.change('22222');
    await page.root.institutionalInformationManager.content.addressCountryCode.change('CA');
    await page.root.institutionalInformationManager.header.save();

    assert.strictEqual(
      page.root.institutionalInformationDetails.content.name,
      'Rocket Surgery Academy',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.aamcCode, '11111');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStreet,
      'Yellow Brick Road 1',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCity, 'Sunnyvale');
    assert.strictEqual(
      page.root.institutionalInformationDetails.content.addressStateOrProvince,
      'AB',
    );
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressZipCode, '22222');
    assert.strictEqual(page.root.institutionalInformationDetails.content.addressCountryCode, 'CA');
  });
});
