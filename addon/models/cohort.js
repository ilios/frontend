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
    this._getRootLevelLearnerGroups.bind(this),
    'cohort.rootLevelLearnerGroups',
    this.learnerGroups,
  ]);

  @use competencies = new DeprecatedAsyncCP(() => [
    this._getCompetencies.bind(this),
    'cohort.competencies',
    this.programYear.get('competencies'),
  ]);

  @use program = new DeprecatedAsyncCP(() => [
    this._getProgram.bind(this),
    'cohort.program',
    this.programYear.get('program'),
  ]);

  @use school = new DeprecatedAsyncCP(() => [
    this._getSchool.bind(this),
    'cohort.school',
    this.programYear.get('program.school'),
  ]);

  @use classOfYear = new DeprecatedAsyncCP(() => [
    this._getClassOfYear.bind(this),
    'cohort.classOfYear',
    this.programYear.get('classOfYear'),
  ]);

  async _getRootLevelLearnerGroups(learnerGroups) {
    return (await learnerGroups)
      .toArray()
      .filter((learnerGroup) => learnerGroup.belongsTo('parent').value() === null);
  }

  async _getCompetencies() {
    const programYear = await this.programYear;
    return await programYear.competencies;
  }

  async _getProgram() {
    const programYear = await this.programYear;
    return await programYear.program;
  }

  async _getSchool() {
    const programYear = await this.programYear;
    const program = await programYear.program;
    return await program.school;
  }

  async _getClassOfYear() {
    const programYear = await this.programYear;
    return await programYear.classOfYear;
  }
}
