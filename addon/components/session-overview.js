import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task, restartableTask, dropTask } from 'ember-concurrency';
import moment from 'moment';
import { validatable, Length, Gte, NotBlank } from 'ilios-common/decorators/validation';
import { hash } from 'rsvp';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import { use } from 'ember-could-get-used-to-this';

@validatable
export default class SessionOverview extends Component {
  @service currentUser;
  @service features;
  @service router;
  @service permissionChecker;
  @service intl;
  @service store;

  @Length(3, 200) @NotBlank() @tracked title = null;
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

  @use prerequisites = new ResolveAsyncValue(() => [this.args.session.prerequisites]);
  @use postrequisite = new ResolveAsyncValue(() => [this.args.session.postrequisite]);
  @use postrequisiteCourse = new ResolveAsyncValue(() => [this.postrequisite?.course]);
  @use ilmSession = new ResolveAsyncValue(() => [this.args.session.ilmSession]);

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
    const sessionTypes = (await school.sessionTypes).slice();
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
        'showSessionSpecialEquipmentRequired'
      ),
    });
    this.showCopy = showCopy;

    this.showAttendanceRequired = showSessionAttendanceRequired;
    this.showSupplemental = showSessionSupplemental;
    this.showSpecialAttireRequired = showSessionSpecialAttireRequired;
    this.showSpecialEquipmentRequired = showSessionSpecialEquipmentRequired;
    this.sessionType = sessionType;

    this.title = session.title;
    this.instructionalNotes = session.instructionalNotes;
    if (ilmSession) {
      this.hours = ilmSession.hours;
      this.isIndependentLearning = true;
    } else {
      this.isIndependentLearning = false;
    }
    this.updatedAt = moment(session.updatedAt).format('L LT');
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
    const schoolCourses = (await school.courses).slice();
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
      ilmSession.deleteRecord();
      await this.args.session.save();
      await ilmSession.save();
    } else {
      const hours = 1;
      const dueDate = moment().add(6, 'weeks').hour('17').minute('00').toDate();
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
  async changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }

    this.removeErrorDisplayFor('title');
    this.args.session.title = this.title;
    await this.args.session.save();
  }

  @action
  revertTitleChanges() {
    this.title = this.args.session.title;
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
