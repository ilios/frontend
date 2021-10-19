import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import { use } from 'ember-could-get-used-to-this';
import DeprecatedAsyncCP from 'ilios-common/classes/deprecated-async-cp';

export default class CohortModel extends Model {
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

  @use rootLevelLearnerGroups = new DeprecatedAsyncCP(() => [
    this.getRootLevelLearnerGroups.bind(this),
    'cohort.rootLevelLearnerGroups',
    this.learnerGroups,
  ]);

  @use competencies = new DeprecatedAsyncCP(() => [
    this.getCompetencies.bind(this),
    'cohort.competencies',
    this.programYear.get('competencies'),
  ]);

  @use program = new DeprecatedAsyncCP(() => [
    this.getProgram.bind(this),
    'cohort.program',
    this.programYear.get('program'),
  ]);

  @use school = new DeprecatedAsyncCP(() => [
    this.getSchool.bind(this),
    'cohort.school',
    this.programYear.get('program.school'),
  ]);

  @use classOfYear = new DeprecatedAsyncCP(() => [
    this.getClassOfYear.bind(this),
    'cohort.classOfYear',
    this.programYear.get('classOfYear'),
  ]);

  async getRootLevelLearnerGroups(learnerGroups) {
    return (await learnerGroups)
      .toArray()
      .filter((learnerGroup) => learnerGroup.belongsTo('parent').value() === null);
  }

  async getCompetencies() {
    const programYear = await this.programYear;
    return await programYear.competencies;
  }

  async getProgram() {
    const programYear = await this.programYear;
    return await programYear.program;
  }

  async getSchool() {
    const programYear = await this.programYear;
    const program = await programYear.program;
    return await program.school;
  }

  async getClassOfYear() {
    const programYear = await this.programYear;
    return await programYear.classOfYear;
  }
}
