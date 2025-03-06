import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task, restartableTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { hash } from 'rsvp';
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

  @tracked instructionalNotes = null;
  @tracked description = null;
  @tracked sessionType = null;
  @tracked isSaving = false;
  @tracked isEditingPostRequisite = false;
  @tracked updatedAt = null;
  @tracked showCopy = false;

  @tracked sessionTypes = [];
  @tracked showAttendanceRequired = false;
  @tracked showSupplemental = false;
  @tracked showSpecialAttireRequired = false;
  @tracked showSpecialEquipmentRequired = false;

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

  load = restartableTask(async (element, [session]) => {
    const course = await session.course;
    const school = await course.school;
    const sessionTypes = await school.sessionTypes;
    const {
      sessionType,
      showCopy,
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired,
    } = await hash({
      course: session.course,
      sessionType: session.sessionType,
      showCopy: this.getShowCopy(session),
      showSessionAttendanceRequired: school.getConfigValue('showSessionAttendanceRequired'),
      showSessionSupplemental: school.getConfigValue('showSessionSupplemental'),
      showSessionSpecialAttireRequired: school.getConfigValue('showSessionSpecialAttireRequired'),
      showSessionSpecialEquipmentRequired: school.getConfigValue(
        'showSessionSpecialEquipmentRequired',
      ),
    });
    this.showCopy = showCopy;

    this.showAttendanceRequired = showSessionAttendanceRequired;
    this.showSupplemental = showSessionSupplemental;
    this.showSpecialAttireRequired = showSessionSpecialAttireRequired;
    this.showSpecialEquipmentRequired = showSessionSpecialEquipmentRequired;
    this.sessionType = sessionType;

    this.instructionalNotes = session.instructionalNotes;
    this.updatedAt = DateTime.fromJSDate(session.updatedAt).toFormat('D t');
    this.sessionTypes = sessionTypes || [];
    this.description = session.description;
  });

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
    this.instructionalNotes = this.args.session.instructionalNotes;
  }

  @action
  setSessionType(event) {
    this.sessionType = findById(this.sessionTypes, event.target.value);
  }

  @action
  changeSessionType() {
    this.args.session.sessionType = this.sessionType;
    this.args.session.save();
  }

  @action
  async revertSessionTypeChanges() {
    this.sessionType = await this.args.session.sessionType;
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

    this.description = html;
  }

  @action
  revertDescriptionChanges() {
    this.description = this.args.session.description;
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
    this.instructionalNotes = html;
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
  });
}
