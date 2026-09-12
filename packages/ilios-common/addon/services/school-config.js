import Service, { service } from '@ember/service';
import { tracked } from 'tracked-built-ins';

const DEFAULT_SHOW_MESH = true;

export default class SchoolConfig extends Service {
  @service store;

  #config = tracked(Map);
  #modifiedConfigs = new Set();

  async load() {
    //we need all the schools, so load through them
    const schools = await this.store.findAll('school', { include: 'configurations' });

    for (const school of schools) {
      let schoolConfig = this.#config.get(Number(school.id));
      if (!schoolConfig) {
        schoolConfig = tracked(new Map());
        this.#config.set(Number(school.id), schoolConfig);
      }
      const configs = await school.configurations;
      configs.forEach(({ name, parsedValue }) => {
        schoolConfig.set(name, parsedValue);
      });
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
    await Promise.all([...this.#modifiedConfigs].map(async (c) => c.save()));
    this.#modifiedConfigs.clear();
    await this.load();
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
      this.#modifiedConfigs.add(config);
    }
  }
}
