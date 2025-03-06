import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task, restartableTask, dropTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import { validatable, Length, Gte, NotBlank } from 'ilios-common/decorators/validation';
import { hash } from 'rsvp';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class SessionOverview extends Component {
  @service currentUser;
  @service router;
  @service permissionChecker;
  @service intl;
  @service store;

  @Length(3, 65000) @tracked instructionalNotes = null;
  @NotBlank() @Gte(0) @tracked hours = null;
  @Length(3, 65000) @tracked description = null;
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
  @tracked isIndependentLearning = false;

  @cached
  get hasErrorForInstructionalNotesData() {
    return new TrackedAsyncData(this.hasErrorFor('instructionalNotes'));
  }

  get hasErrorForInstructionalNotes() {
    return this.hasErrorForInstructionalNotesData.isResolved
      ? this.hasErrorForInstructionalNotesData.value
      : false;
  }

  @cached
  get hasErrorForDescriptionData() {
    return new TrackedAsyncData(this.hasErrorFor('description'));
  }

  get hasErrorForDescription() {
    return this.hasErrorForDescriptionData.isResolved
      ? this.hasErrorForDescriptionData.value
      : false;
  }

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
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
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

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
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
      ilmSession,
      sessionType,
      showCopy,
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired,
    } = await hash({
      course: session.course,
      ilmSession: session.ilmSession,
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
    if (ilmSession) {
      this.hours = ilmSession.hours;
      this.isIndependentLearning = true;
    } else {
      this.isIndependentLearning = false;
    }
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

  saveIndependentLearning = dropTask(async (value) => {
    this.isIndependentLearning = value;
    if (!value) {
      const ilmSession = await this.args.session.ilmSession;
      this.args.session.set('ilmSession', null);
      await ilmSession.destroyRecord();
      await this.args.session.save();
    } else {
      const hours = 1;
      const dueDate = DateTime.now().plus({ week: 6 }).set({ hour: 17, minute: 0 }).toJSDate();
      this.hours = hours;
      const ilmSession = this.store.createRecord('ilm-session', {
        session: this.args.session,
        hours,
        dueDate,
      });
      this.args.session.set('ilmSession', await ilmSession.save());
      await this.args.session.save();
    }
  });

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

  @action
  async changeIlmHours() {
    this.addErrorDisplayFor('hours');
    const isValid = await this.isValid('hours');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('hours');
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      ilmSession.hours = this.hours;
      await ilmSession.save();
    }
  }

  @action
  async revertIlmHoursChanges() {
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      this.hours = ilmSession.hours;
    }
  }

  saveDescription = task(async () => {
    this.addErrorDisplayFor('description');
    const isValid = await this.isValid('description');

    if (!isValid) {
      return false;
    }

    this.removeErrorDisplayFor('description');
    this.args.session.description = this.description;
    await this.args.session.save();
  });

  @action
  changeDescription(html) {
    this.addErrorDisplayFor('description');
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
    this.addErrorDisplayFor('instructionalNotes');
    const noTagsText = html.replace(/(<([^>]+)>)/gi, '');
    const strippedText = noTagsText.replace(/&nbsp;/gi, '').replace(/\s/g, '');

    //if all we have is empty html then save null
    if (strippedText.length === 0) {
      html = null;
    }
    this.instructionalNotes = html;
  }

  saveInstructionalNotes = task(async () => {
    this.addErrorDisplayFor('instructionalNotes');
    const isValid = await this.isValid('instructionalNotes');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('instructionalNotes');
    this.args.session.instructionalNotes = this.instructionalNotes;

    await this.args.session.save();
  });
}
