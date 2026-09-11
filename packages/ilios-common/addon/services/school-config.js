import Service, { service } from '@ember/service';

const DEFAULT_SHOW_MESH = true;

export default class SchoolConfig extends Service {
  @service store;

  #config = new Map();
  #dirtyConfigs = new Set();

  async setup() {
    //we need all the schools, so load through them
    const schools = await this.store.findAll('school', { include: 'configurations' });

    for (const school of schools) {
      const schoolConfig = new Map();
      const configs = await school.configurations;
      configs.forEach(({ name, parsedValue }) => {
        schoolConfig.set(name, parsedValue);
      });
      this.#config.set(Number(school.id), schoolConfig);
    }
  }

  getShowSessionAttendanceRequired(schoolId) {
    return this.#config.get(Number(schoolId))?.get('showSessionAttendanceRequired');
  }

  getShowSessionSupplemental(schoolId) {
    return this.#config.get(Number(schoolId))?.get('showSessionSupplemental');
  }

  getShowSessionSpecialAttireRequired(schoolId) {
    return this.#config.get(Number(schoolId))?.get('showSessionSpecialAttireRequired');
  }

  getShowSessionSpecialEquipmentRequired(schoolId) {
    return this.#config.get(Number(schoolId))?.get('showSessionSpecialEquipmentRequired');
  }

  getAllowMultipleCourseObjectiveParents(schoolId) {
    return this.#config.get(Number(schoolId))?.get('allowMultipleCourseObjectiveParents');
  }

  getLearningMaterialAccessibilityRequirementsLink(schoolId) {
    return this.#config.get(Number(schoolId))?.get('learningMaterialAccessibilityRequirementsLink');
  }

  getLearningMaterialAccessibilityRequired(schoolId) {
    return this.#config.get(Number(schoolId))?.get('learningMaterialAccessibilityRequired');
  }

  getShowMeSH(schoolId) {
    return this.#config.get(Number(schoolId))?.get('showMeSH') ?? DEFAULT_SHOW_MESH;
  }

  async setShowSessionAttendanceRequired(schoolId, value) {
    return this.#setValue(schoolId, 'showSessionAttendanceRequired', value);
  }

  async setShowSessionSupplemental(schoolId, value) {
    return this.#setValue(schoolId, 'showSessionSupplemental', value);
  }

  async setShowSessionSpecialAttireRequired(schoolId, value) {
    return this.#setValue(schoolId, 'showSessionSpecialAttireRequired', value);
  }

  async setShowSessionSpecialEquipmentRequired(schoolId, value) {
    return this.#setValue(schoolId, 'showSessionSpecialEquipmentRequired', value);
  }

  async setLearningMaterialAccessibilityRequired(schoolId, value) {
    return this.#setValue(schoolId, 'learningMaterialAccessibilityRequired', value);
  }

  async setLearningMaterialAccessibilityRequirementsLink(schoolId, value) {
    return this.#setValue(schoolId, 'learningMaterialAccessibilityRequirementsLink', value);
  }

  async save() {
    await Promise.all([...this.#dirtyConfigs].map(async (c) => c.save()));
    this.#dirtyConfigs.forEach((config) => {
      const schoolId = config.belongsTo('school').id();
      let schoolConfig = this.#config.get(Number(schoolId));
      if (!schoolConfig) {
        schoolConfig = new Map();
        this.#config.set(Number(schoolId), schoolConfig);
      }
      schoolConfig.set(config.name, config.parsedValue);
    });
    this.#dirtyConfigs.clear();
  }

  async #setValue(schoolId, name, value) {
    const school = await this.store.peekRecord('school', schoolId);
    const configs = await school.configurations;
    let config = configs.find((config) => config.name === name);
    if (!config) {
      config = this.store.createRecord('school-config', {
        school,
        name,
      });
    }
    if (config.parsedValue !== value) {
      config.value = value;
      this.#dirtyConfigs.add(config);
    }
  }
}
