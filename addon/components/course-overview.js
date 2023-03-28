import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { validatable, Length, BeforeDate, AfterDate } from 'ilios-common/decorators/validation';
import { findById } from 'ilios-common/utils/array-helpers';

@validatable
export default class CourseOverview extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service router;
  @service store;

  universalLocator = 'ILIOS';

  @Length(2, 255) @tracked externalId = null;
  @BeforeDate('endDate', { granularity: 'day' }) @tracked startDate = null;
  @AfterDate('startDate', { granularity: 'day' }) @tracked endDate = null;
  @tracked level = null;
  @tracked levelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  @tracked clerkshipTypeId;
  @tracked clerkshipTypeOptions;
  @tracked canCreateCourseInSchool = false;
  @tracked school = null;

  load = restartableTask(async () => {
    this.clerkshipTypeOptions = await this.store.peekAll('course-clerkship-type');
    this.externalId = this.args.course.externalId;
    this.startDate = this.args.course.startDate;
    this.endDate = this.args.course.endDate;
    this.level = this.args.course.level;
    this.school = await this.args.course.school;
    this.clerkshipTypeId = this.args.course.belongsTo('clerkshipType').id();
    this.canCreateCourseInSchool = await this.permissionChecker.canCreateCourse(this.school);
  });

  get selectedClerkshipType() {
    if (!this.clerkshipTypeId) {
      return null;
    }

    return findById(this.clerkshipTypeOptions, this.clerkshipTypeId);
  }

  get showRollover() {
    if (this.router.currentRouteName === 'course.rollover') {
      return false;
    }

    return this.canCreateCourseInSchool;
  }

  get clerkshipTypeTitle() {
    if (!this.selectedClerkshipType) {
      return this.intl.t('general.notAClerkship');
    }

    return this.selectedClerkshipType.title;
  }
  @action
  async changeClerkshipType() {
    this.args.course.set('clerkshipType', this.selectedClerkshipType);
    return this.args.course.save();
  }

  @action
  setCourseClerkshipType(event) {
    let id = event.target.value;
    //convert the string 'null' to a real null
    if (id === 'null') {
      id = null;
    }
    this.clerkshipTypeId = id;
  }

  revertClerkshipTypeChanges = restartableTask(async () => {
    const clerkshipType = await this.args.course.clerkshipType;
    if (clerkshipType) {
      this.clerkshipTypeId = clerkshipType.id;
    } else {
      this.clerkshipTypeId = null;
    }
  });

  changeStartDate = restartableTask(async () => {
    this.addErrorDisplayFor('startDate');
    const isValid = await this.isValid('startDate');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('startDate');
    this.args.course.set('startDate', this.startDate);
    await this.args.course.save();
    this.startDate = this.args.course.startDate;
  });

  @action
  revertStartDateChanges() {
    this.startDate = this.args.course.startDate;
  }

  changeEndDate = restartableTask(async () => {
    this.addErrorDisplayFor('endDate');
    const isValid = await this.isValid('endDate');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('endDate');
    this.args.course.set('endDate', this.endDate);
    await this.args.course.save();
    this.endDate = this.args.course.endDate;
  });

  @action
  revertEndDateChanges() {
    this.endDate = this.args.course.endDate;
  }

  changeExternalId = restartableTask(async () => {
    this.addErrorDisplayFor('externalId');
    const isValid = await this.isValid('externalId');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('externalId');
    this.args.course.set('externalId', this.externalId);
    await this.args.course.save();
    this.externalId = this.args.course.externalId;
  });

  @action
  revertExternalIdChanges() {
    this.externalId = this.args.course.externalId;
  }

  @action
  setLevel(event) {
    this.level = parseInt(event.target.value, 10);
  }

  @action
  async changeLevel() {
    this.args.course.set('level', this.level);
    return this.args.course.save();
  }

  @action
  revertLevelChanges() {
    this.level = this.args.course.level;
  }
}
