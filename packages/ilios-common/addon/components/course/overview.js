import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string, date } from 'yup';
import { DateTime } from 'luxon';

export default class CourseOverview extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service router;
  @service store;

  universalLocator = 'ILIOS';

  @tracked externalId = null;
  @tracked startDate = null;
  @tracked endDate = null;
  @tracked level = null;
  @tracked levelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  @tracked clerkshipTypeId;
  @tracked clerkshipTypeOptions;

  constructor() {
    super(...arguments);
    const { course } = this.args;
    this.clerkshipTypeOptions = this.store.peekAll('course-clerkship-type');
    this.externalId = course.externalId;
    this.startDate = course.startDate;
    this.endDate = course.endDate;
    this.level = course.level;
    this.clerkshipTypeId = course.belongsTo('clerkshipType').id();
  }

  validations = new YupValidations(this, {
    externalId: string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .min(2)
      .max(255),
    startDate: date()
      .required()
      .test(
        'is-before-end-date',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.before',
            values: {
              before: this.intl.t('general.endDate'),
            },
          };
        },
        (value) => {
          const startDate = DateTime.fromJSDate(value);
          const endDate = DateTime.fromJSDate(this.endDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
    endDate: date()
      .required()
      .test(
        'is-after-start-date',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.after',
            values: {
              after: this.intl.t('general.startDate'),
            },
          };
        },
        (value) => {
          const endDate = DateTime.fromJSDate(value);
          const startDate = DateTime.fromJSDate(this.startDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
  });

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.args.course.school);
  }

  @cached
  get canCreateCourseInSchoolData() {
    return new TrackedAsyncData(this.permissionChecker.canCreateCourse(this.schoolData.value));
  }

  get canCreateCourseInSchool() {
    return this.schoolData.isResolved && this.canCreateCourseInSchoolData.isResolved
      ? this.canCreateCourseInSchoolData.value
      : false;
  }

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
    this.validations.addErrorDisplayFor('startDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('startDate');
    this.args.course.set('startDate', this.startDate);
    await this.args.course.save();
    this.startDate = this.args.course.startDate;
  });

  @action
  revertStartDateChanges() {
    this.validations.removeErrorDisplayFor('startDate');
    this.startDate = this.args.course.startDate;
  }

  changeEndDate = restartableTask(async () => {
    this.validations.addErrorDisplayFor('endDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('endDate');
    this.args.course.set('endDate', this.endDate);
    await this.args.course.save();
    this.endDate = this.args.course.endDate;
  });

  @action
  revertEndDateChanges() {
    this.validations.removeErrorDisplayFor('endDate');
    this.endDate = this.args.course.endDate;
  }

  changeExternalId = restartableTask(async () => {
    this.validations.addErrorDisplayFor('externalId');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('externalId');
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
