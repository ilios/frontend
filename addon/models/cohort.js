import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { deprecate } from '@ember/debug';

export default class Cohort extends Model {
  @attr('string')
  title;

  @belongsTo('program-year', { async: true })
  programYear;

  @hasMany('course', { async: true })
  courses;

  @hasMany('learner-group', { async: true })
  learnerGroups;

  @hasMany('user', { async: true })
  users;

  get rootLevelLearnerGroups() {
    deprecate('cohort.rootLevelLearnerGroups Computed Called', false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });

    return this.getRootLevelLearnerGroups();
  }

  async getRootLevelLearnerGroups() {
    const learnerGroups = (await this.learnerGroups).toArray();
    return learnerGroups.filter(
      (learnerGroup) => learnerGroup.belongsTo('parent').value() === null
    );
  }

  get competencies() {
    deprecate('cohort.competencies Computed Called', false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });
    return this.getCompetencies();
  }

  async getCompetencies() {
    const programYear = await this.programYear;
    return await programYear.competencies;
  }

  get program() {
    deprecate('cohort.program Computed Called', false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });
    return this.getProgram();
  }

  async getProgram() {
    const programYear = await this.programYear;
    return await programYear.program;
  }

  get school() {
    deprecate('cohort.school Computed Called', false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });
    return this.getSchool();
  }

  async getSchool() {
    const programYear = await this.programYear;
    const program = await programYear.program;
    return await program.school;
  }

  get classOfYear() {
    deprecate('cohort.classOfYear Computed Called', false, {
      id: 'common.async-cohort-computed',
      for: 'ilios-common',
      until: '61',
      since: '59.4.0',
    });
    return this.getClassOfYear();
  }

  async getClassOfYear() {
    const programYear = await this.programYear;
    return await programYear.classOfYear;
  }
}
