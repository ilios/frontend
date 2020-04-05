import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task, restartableTask, dropTask } from 'ember-concurrency-decorators';
import moment from 'moment';
import { validatable, Length, Gte, NotBlank } from 'ilios-common/decorators/validation';
import { hash } from 'rsvp';

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
  @NotBlank()@tracked dueDate = null;
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
  @tracked description;

  get filteredSessionTypes() {
    const selectedSessionTypeId = isEmpty(this.sessionType) ? -1 : this.sessionType.id;
    return this.sessionTypes.filter(sessionType => {
      return (sessionType.active || sessionType.id === selectedSessionTypeId);
    });
  }

  get sortedSessionTypes() {
    return this.filteredSessionTypes.sortBy('title');
  }

  @restartableTask
  *load(element, [session, sessionTypes]) {
    const course = yield session.course;
    const school = yield course.school;
    const {
      ilmSession,
      sessionDescription,
      sessionType,
      showCopy,
      showSessionAttendanceRequired,
      showSessionSupplemental,
      showSessionSpecialAttireRequired,
      showSessionSpecialEquipmentRequired,
    } = yield hash({
      course: session.course,
      ilmSession: session.ilmSession,
      sessionDescription: session.sessionDescription,
      sessionType: session.sessionType,
      showCopy: this.getShowCopy(session),
      showSessionAttendanceRequired: school.getConfigValue('showSessionAttendanceRequired'),
      showSessionSupplemental: school.getConfigValue('showSessionSupplemental'),
      showSessionSpecialAttireRequired: school.getConfigValue('showSessionSpecialAttireRequired'),
      showSessionSpecialEquipmentRequired: school.getConfigValue('showSessionSpecialEquipmentRequired'),
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
      this.dueDate = ilmSession.dueDate;
      this.isIndependentLearning = true;
    } else {
      this.isIndependentLearning = false;
    }
    this.updatedAt = moment(session.updatedAt).format("L LT");
    this.sessionTypes = sessionTypes || [];
    if (sessionDescription) {
      this.description = sessionDescription.description;
    }
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
    const schoolCourses = (await school.courses).toArray();
    let schoolCourse;
    for (schoolCourse of schoolCourses) {
      if (await this.permissionChecker.canCreateSession(schoolCourse)) {
        return true;
      }
    }

    return false;
  }

  @dropTask
  *saveIndependentLearning(value) {
    this.isIndependentLearning = value;
    if (!value) {
      const ilmSession = yield this.args.session.ilmSession;
      this.args.session.set('ilmSession', null);
      ilmSession.deleteRecord();
      yield this.args.session.save();
      yield ilmSession.save();
    } else {
      const hours = 1;
      const dueDate = moment().add(6, 'weeks').toDate();
      this.hours = hours;
      this.dueDate = dueDate;
      const ilmSession = this.store.createRecord('ilm-session', {
        session: this.args.session,
        hours,
        dueDate
      });
      this.args.session.set('ilmSession', (yield ilmSession.save()));
      yield this.args.session.save();
    }
  }

  @action
  async changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (! isValid) {
      return false;
    }

    this.removeErrorDisplayFor('title');
    this.args.session.title = this.title;
    await this.args.session.save();
  }

  @action
  revertTitleChanges(){
    this.title = this.args.session.title;
  }

  @action
  revertInstructionalNotesChanges(){
    this.instructionalNotes = this.args.session.instructionalNotes;
  }

  @action
  setSessionType(event){
    this.sessionType = this.sessionTypes.findBy('id', event.target.value);
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
    if (! isValid) {
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
  async revertIlmHoursChanges(){
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      this.hours = ilmSession.hours;
    }
  }

  @action
  async changeIlmDueDate() {
    this.addErrorDisplayFor('dueDate');
    const isValid = await this.isValid('dueDate');

    if (! isValid) {
      return false;
    }
    this.removeErrorDisplayFor('dueDate');
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession){
      ilmSession.dueDate = this.dueDate;
      await ilmSession.save();
    }
  }

  @action
  async revertIlmDueDateChanges(){
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      this.dueDate = ilmSession.dueDate;
    }
  }

  @action
  async saveDescription() {
    this.addErrorDisplayFor('description');
    const isValid = await this.isValid('description');

    if (! isValid) {
      return false;
    }

    this.removeErrorDisplayFor('description');
    let sessionDescription = await this.args.session.sessionDescription;
    if (isEmpty(this.description) && sessionDescription){
      await sessionDescription.deleteRecord();
    } else {
      if (! sessionDescription) {
        sessionDescription = this.store.createRecord('session-description');
        sessionDescription.session = this.args.session;
      }

      sessionDescription.description = this.description;
    }

    if (sessionDescription) {
      await sessionDescription.save();
    }
  }

  @action
  changeDescription(html){
    this.addErrorDisplayFor('description');
    const noTagsText = html.replace(/(<([^>]+)>)/ig,"");
    const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

    //if all we have is empty html then save null
    if(strippedText.length === 0){
      html = null;
    }

    this.description = html;
  }

  @action
  changeInstructionalNotes(html){
    this.addErrorDisplayFor('instructionalNotes');
    const noTagsText = html.replace(/(<([^>]+)>)/ig,"");
    const strippedText = noTagsText.replace(/&nbsp;/ig,"").replace(/\s/g, "");

    //if all we have is empty html then save null
    if(strippedText.length === 0){
      html = null;
    }
    this.instructionalNotes = html;
  }

  @task
  *revertDescriptionChanges(){
    const sessionDescription = yield this.args.session.sessionDescription;
    if (sessionDescription) {
      this.description = sessionDescription.description;
    } else {
      this.description = null;
    }
  }

  @task
  *saveInstructionalNotes() {
    this.addErrorDisplayFor('instructionalNotes');
    const isValid = yield this.isValid('instructionalNotes');
    if (! isValid) {
      return false;
    }
    this.removeErrorDisplayFor('instructionalNotes');
    this.args.session.instructionalNotes = this.instructionalNotes;

    yield this.args.session.save();
  }
}
