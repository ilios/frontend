import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupMSW } from 'ilios-common/msw';
import { formatJsonApi } from 'ilios-common/msw/utils/json-api-formatter.js';

module('Integration | Service | school config', function (hooks) {
  setupTest(hooks);
  setupMSW(hooks);

  hooks.beforeEach(function () {
    this.store = this.owner.lookup('service:store');
    this.schoolConfig = this.owner.lookup('service:school-config');
  });

  test('it exists', function (assert) {
    assert.ok(this.schoolConfig);
  });

  test('setup() loads school configuration values', async function (assert) {
    const school = await this.server.create('school');

    await this.server.create('school-config', {
      school,
      name: 'showMeSH',
      value: 'true',
    });
    await this.server.create('school-config', {
      school,
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: 'https://example.edu/accessibility',
    });
    await this.server.create('school-config', {
      school,
      name: 'learningMaterialAccessibilityRequired',
      value: 'true',
    });
    await this.server.create('school-config', {
      school,
      name: 'showSessionAttendanceRequired',
      value: 'true',
    });
    await this.server.create('school-config', {
      school,
      name: 'showSessionSupplemental',
      value: 'false',
    });
    await this.server.create('school-config', {
      school,
      name: 'showSessionSpecialAttireRequired',
      value: 'true',
    });
    await this.server.create('school-config', {
      school,
      name: 'showSessionSpecialEquipmentRequired',
      value: 'false',
    });
    await this.server.create('school-config', {
      school,
      name: 'allowMultipleCourseObjectiveParents',
      value: 'true',
    });

    await this.schoolConfig.setup();

    assert.true(this.schoolConfig.getShowMeSH(school.id));
    assert.strictEqual(
      this.schoolConfig.getLearningMaterialAccessibilityRequirementsLink(school.id),
      'https://example.edu/accessibility',
    );
    assert.true(this.schoolConfig.getLearningMaterialAccessibilityRequired(school.id));
    assert.true(this.schoolConfig.getShowSessionAttendanceRequired(school.id));
    assert.false(this.schoolConfig.getShowSessionSupplemental(school.id));
    assert.true(this.schoolConfig.getShowSessionSpecialAttireRequired(school.id));
    assert.false(this.schoolConfig.getShowSessionSpecialEquipmentRequired(school.id));
    assert.true(this.schoolConfig.getAllowMultipleCourseObjectiveParents(school.id));
  });

  test('configuration values are unique to the school', async function (assert) {
    const school1 = await this.server.create('school');
    const school2 = await this.server.create('school');

    await this.server.create('school-config', {
      school: school1,
      name: 'showSessionSupplemental',
      value: 'true',
    });
    await this.server.create('school-config', {
      school: school2,
      name: 'showSessionSupplemental',
      value: 'false',
    });

    await this.schoolConfig.setup();

    assert.true(this.schoolConfig.getShowSessionSupplemental(school1.id));
    assert.false(this.schoolConfig.getShowSessionSupplemental(school2.id));
  });

  test('creating a new config', async function (assert) {
    const school = await this.server.create('school');
    const schoolModel = await this.store.findRecord('school', school.id);

    this.server.post('/api/schoolconfigs', async ({ request }) => {
      const { data } = await request.json();

      assert.strictEqual(data.attributes.name, 'showSessionSupplemental');
      assert.strictEqual(data.attributes.value, 'false');

      const config = await this.server.create('school-config', {
        name: data.attributes.name,
        value: data.attributes.value,
      });
      assert.step('POST called');
      return formatJsonApi(config, 'schoolConfig');
    });

    await this.schoolConfig.setShowSessionSupplemental(school.id, false);
    const configs = await schoolModel.configurations;
    const config = configs.find(({ name }) => name === 'showSessionSupplemental');

    assert.ok(config);
    assert.strictEqual(config.name, 'showSessionSupplemental');
    assert.false(config.parsedValue);

    await this.schoolConfig.save();

    assert.false(this.schoolConfig.getShowSessionSupplemental(school.id));
    assert.verifySteps(['POST called']);
  });

  test.each(
    'create and save',
    [
      {
        configName: 'showSessionAttendanceRequired',
        value: true,
      },
      {
        configName: 'showSessionSpecialAttireRequired',
        value: true,
      },
      {
        configName: 'showSessionSpecialEquipmentRequired',
        value: true,
      },
      {
        configName: 'learningMaterialAccessibilityRequired',
        value: true,
      },
      {
        configName: 'learningMaterialAccessibilityRequirementsLink',
        value: 'https://example.edu/accessibility',
      },
    ],
    async function (assert, { configName, value }) {
      const school = await this.server.create('school');
      const schoolModel = await this.store.findRecord('school', school.id);

      const upperCase = configName[0].toUpperCase() + configName.slice(1);
      const setter = `set${upperCase}`;
      const getter = `get${upperCase}`;

      this.server.post('/api/schoolconfigs', async ({ request }) => {
        const { data } = await request.json();

        assert.step('POST called');
        assert.strictEqual(data.attributes.name, configName);
        assert.strictEqual(data.attributes.value, String(value));

        const config = await this.server.create('school-config', {
          name: data.attributes.name,
          value: data.attributes.value,
        });

        return formatJsonApi(config, 'schoolConfig');
      });

      await this.schoolConfig[setter](school.id, value);

      const configs = await schoolModel.configurations;
      const config = configs.find(({ name }) => name === configName);

      assert.ok(config);
      assert.strictEqual(config.parsedValue, value);

      await this.schoolConfig.save();

      assert.strictEqual(this.schoolConfig[getter](school.id), value);
      assert.verifySteps(['POST called']);
    },
  );

  test.each(
    'update existing and save',
    [
      {
        configName: 'showSessionAttendanceRequired',
        initialValue: 'false',
        value: true,
      },
      {
        configName: 'showSessionSpecialAttireRequired',
        initialValue: 'false',
        value: true,
      },
      {
        configName: 'showSessionSpecialEquipmentRequired',
        initialValue: 'false',
        value: true,
      },
      {
        configName: 'learningMaterialAccessibilityRequired',
        initialValue: 'false',
        value: true,
      },
      {
        configName: 'learningMaterialAccessibilityRequirementsLink',
        initialValue: 'https://example.edu/old-accessibility',
        value: 'https://example.edu/accessibility',
      },
    ],
    async function (assert, { configName, initialValue, value }) {
      const school = await this.server.create('school');
      const existingConfig = await this.server.create('school-config', {
        school,
        name: configName,
        value: initialValue,
      });

      await this.schoolConfig.setup();

      const upperCase = configName[0].toUpperCase() + configName.slice(1);
      const setter = `set${upperCase}`;
      const getter = `get${upperCase}`;

      this.server.patch('/api/schoolconfigs/:id', async ({ params, request }) => {
        const { data } = await request.json();

        assert.strictEqual(Number(params.id), Number(existingConfig.id));
        assert.strictEqual(data.attributes.name, configName);
        assert.strictEqual(data.attributes.value, String(value));

        existingConfig.value = data.attributes.value;

        assert.step('PATCH called');
        return formatJsonApi(existingConfig, 'schoolConfig');
      });

      await this.schoolConfig[setter](school.id, value);

      const schoolModel = await this.store.findRecord('school', school.id);
      const configs = await schoolModel.configurations;
      const config = configs.find(({ name }) => name === configName);

      assert.ok(config);
      assert.strictEqual(config.parsedValue, value);

      await this.schoolConfig.save();

      assert.strictEqual(config.parsedValue, value);
      assert.strictEqual(this.schoolConfig[getter](school.id), value);
      assert.verifySteps(['PATCH called']);
    },
  );

  test('setting the same value', async function (assert) {
    const school = await this.server.create('school');

    await this.server.create('school-config', {
      school,
      name: 'showSessionSupplemental',
      value: 'true',
    });

    await this.schoolConfig.setup();

    this.server.post('/api/schoolconfigs', function () {
      assert.step('POST called');
    });

    this.server.patch('/api/schoolconfigs/:id', function () {
      assert.step('PATCH called');
    });

    await this.schoolConfig.setShowSessionSupplemental(school.id, true);
    await this.schoolConfig.save();

    assert.true(this.schoolConfig.getShowSessionSupplemental(school.id));
    assert.verifySteps([]);
  });

  test('save() sends PATCH only for dirty existing configurations', async function (assert) {
    const school = await this.server.create('school');
    const config = await this.server.create('school-config', {
      school,
      name: 'showSessionSupplemental',
      value: 'false',
    });
    await this.server.create('school-config', {
      school,
      name: 'learningMaterialAccessibilityRequirementsLink',
      value: 'true',
    });
    await this.server.create('school-config', {
      school,
      name: 'showSessionSpecialEquipmentRequired',
      value: 'false',
    });

    await this.schoolConfig.setup();

    this.server.post('/api/schoolconfigs', function () {
      assert.step('POST called');
    });

    this.server.patch('/api/schoolconfigs/:id', async ({ request }) => {
      const { data } = await request.json();
      assert.step(`${data.attributes.name} PATCH called`);
      return formatJsonApi(config, 'schoolConfig');
    });

    await this.schoolConfig.setShowSessionSupplemental(school.id, true);
    await this.schoolConfig.setShowSessionSpecialEquipmentRequired(school.id, false);
    await this.schoolConfig.setLearningMaterialAccessibilityRequirementsLink(school.id, true);
    await this.schoolConfig.save();

    assert.verifySteps(['showSessionSupplemental PATCH called']);
  });
});
