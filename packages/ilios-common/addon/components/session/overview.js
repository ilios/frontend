import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class SessionOverview extends Component {
  @service currentUser;
  @service router;
  @service permissionChecker;
  @service intl;
  @service store;

  @tracked localInstructionalNotes;
  @tracked localDescription;
  @tracked localSessionType;
  @tracked isEditingPostRequisite = false;

  validations = new YupValidations(this, {
    instructionalNotes: string().nullable().min(3).max(65000),
    description: string().nullable().min(3).max(65000),
  });

  @cached
  get prerequisitesData() {
    return new TrackedAsyncData(this.args.session.prerequisites);
  }

  @cached
  get postrequisiteData() {
    return new TrackedAsyncData(this.args.session.postrequisite);
  }

  @cached
  get postrequisiteCourseData() {
    return new TrackedAsyncData(this.postrequisite?.course);
  }

  @cached
  get sessionTypeData() {
    return new TrackedAsyncData(this.args.session.sessionType);
  }

  @cached
  get courseData() {
    return new TrackedAsyncData(this.args.session.course);
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.courseData.isResolved ? this.courseData.value.school : null);
  }

  @cached
  get sessionTypesData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved ? this.schoolData.value?.sessionTypes : null,
    );
  }

  get sessionTypes() {
    if (!this.sessionTypesData.isResolved || !this.sessionTypesData.value) {
      return [];
    }

    return this.sessionTypesData.value;
  }

  @cached
  get showAttendanceRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionAttendanceRequired')
        : false,
    );
  }

  @cached
  get showSupplementalData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSupplemental')
        : false,
    );
  }

  @cached
  get showSpecialAttireRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSpecialAttireRequired')
        : false,
    );
  }

  @cached
  get showSpecialEquipmentRequiredData() {
    return new TrackedAsyncData(
      this.schoolData.isResolved
        ? this.schoolData.value?.getConfigValue('showSessionSpecialEquipmentRequired')
        : false,
    );
  }

  get showAttendanceRequired() {
    return this.showAttendanceRequiredData.isResolved
      ? this.showAttendanceRequiredData.value
      : false;
  }

  get showSupplemental() {
    return this.showSupplementalData.isResolved ? this.showSupplementalData.value : false;
  }

  get showSpecialAttireRequired() {
    return this.showSpecialAttireRequiredData.isResolved
      ? this.showSpecialAttireRequiredData.value
      : false;
  }

  get showSpecialEquipmentRequired() {
    return this.showSpecialEquipmentRequiredData.isResolved
      ? this.showSpecialEquipmentRequiredData.value
      : false;
  }

  @cached
  get showCopyData() {
    return new TrackedAsyncData(this.getShowCopy(this.args.session));
  }

  get showCopy() {
    return this.showCopyData.isResolved ? this.showCopyData.value : false;
  }

  get prerequisites() {
    return this.prerequisitesData.isResolved ? this.prerequisitesData.value : null;
  }

  get postrequisite() {
    return this.postrequisiteData.isResolved ? this.postrequisiteData.value : null;
  }

  get postrequisiteCourse() {
    return this.postrequisiteCourseData.isResolved ? this.postrequisiteCourseData.value : null;
  }

  get filteredSessionTypes() {
    const selectedSessionTypeId = isEmpty(this.sessionType) ? -1 : this.sessionType.id;
    return this.sessionTypes.filter((sessionType) => {
      return sessionType.active || sessionType.id === selectedSessionTypeId;
    });
  }

  get sortedSessionTypes() {
    return sortBy(this.filteredSessionTypes, 'title');
  }

  get instructionalNotes() {
    const instructionalNotes =
      this.localInstructionalNotes === undefined
        ? this.args.session.instructionalNotes
        : this.localInstructionalNotes;
    if (instructionalNotes === '') {
      return null;
    }

    return instructionalNotes;
  }

  get description() {
    const description =
      this.localDescription === undefined ? this.args.session.description : this.localDescription;
    if (description === '') {
      return null;
    }

    return description;
  }

  get sessionType() {
    if (this.localSessionType === undefined) {
      return this.sessionTypeData.isResolved ? this.sessionTypeData.value : null;
    }
    return this.localSessionType;
  }

  get isLoaded() {
    return (
      this.sessionTypesData.isResolved &&
      this.sessionTypeData.isResolved &&
      this.showAttendanceRequiredData.isResolved &&
      this.showSupplementalData.isResolved &&
      this.showSpecialAttireRequiredData.isResolved &&
      this.showSpecialEquipmentRequiredData.isResolved &&
      this.showCopyData.isResolved
    );
  }

  /**
   * Check if a user is allowed to create a session anywhere
   * Try and do this by loading as little data as possible, but in the
   * end we do need to check every course in the school.
   */
  async getShowCopy(session) {
    if (this.router.currentRouteName === 'session.copy') {
      return false;
    }

    const course = await session.course;
    if (await this.permissionChecker.canCreateSession(course)) {
      return true;
    }
    const user = await this.currentUser.getModel();
    const allRelatedCourses = await user.allRelatedCourses;
    let relatedCourse;
    for (relatedCourse of allRelatedCourses) {
      if (await this.permissionChecker.canCreateSession(relatedCourse)) {
        return true;
      }
    }
    const school = await course.school;
    const schoolCourses = await school.courses;
    let schoolCourse;
    for (schoolCourse of schoolCourses) {
      if (await this.permissionChecker.canCreateSession(schoolCourse)) {
        return true;
      }
    }

    return false;
  }

  @action
  revertInstructionalNotesChanges() {
    this.localInstructionalNotes = undefined;
  }

  @action
  setSessionType(event) {
    this.localSessionType = findById(this.sessionTypes, event.target.value);
  }

  @action
  changeSessionType() {
    this.args.session.sessionType = this.sessionType;
    this.args.session.save();
    this.localSessionType = undefined;
  }

  @action
  async revertSessionTypeChanges() {
    this.localSessionType = undefined;
  }

  @action
  changeSupplemental(value) {
    this.args.session.supplemental = value;
    this.args.session.save();
  }

  @action
  changeSpecialEquipment(value) {
    this.args.session.equipmentRequired = value;
    this.args.session.save();
  }

  @action
  changeSpecialAttire(value) {
    this.args.session.attireRequired = value;
    this.args.session.save();
  }

  @action
  changeAttendanceRequired(value) {
    this.args.session.attendanceRequired = value;
    this.args.session.save();
  }

  saveDescription = task(async () => {
    this.validations.addErrorDisplayFor('description');
    const isValid = await this.validations.isValid();

    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('description');
    this.args.session.description = this.description;
    await this.args.session.save();
    this.localDescription = undefined;
  });

  @action
  changeDescription(html) {
    this.validations.addErrorDisplayFor('description');
    const noTagsText = html.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    //if all we have is empty html then save null
    if (strippedText.length === 0) {
      html = null;
    }

    this.localDescription = html;
  }

  @action
  revertDescriptionChanges() {
    this.localDescription = undefined;
  }

  @action
  changeInstructionalNotes(html) {
    this.validations.addErrorDisplayFor('instructionalNotes');
    const noTagsText = html.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    //if all we have is empty html then save null
    if (strippedText.length === 0) {
      html = null;
    }
    this.localInstructionalNotes = html;
  }

  saveInstructionalNotes = task(async () => {
    this.validations.addErrorDisplayFor('instructionalNotes');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('instructionalNotes');
    this.args.session.instructionalNotes = this.instructionalNotes;

    await this.args.session.save();
    this.localInstructionalNotes = undefined;
  });
}
