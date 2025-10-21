import Component from '@glimmer/component';
import { service } from '@ember/service';
import { all, filter } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { action } from '@ember/object';
import { cached, tracked } from '@glimmer/tracking';
import { DateTime } from 'luxon';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { uniqueId, get } from '@ember/helper';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import and from 'ember-truth-helpers/helpers/and';
import isArray from 'ember-truth-helpers/helpers/is-array';
import { on } from '@ember/modifier';
import isEqual from 'ember-truth-helpers/helpers/is-equal';
import add from 'ember-math-helpers/helpers/add';
import sortBy0 from 'ilios-common/helpers/sort-by';
import or from 'ember-truth-helpers/helpers/or';
import not from 'ember-truth-helpers/helpers/not';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class SessionCopyComponent extends Component {
  @service store;
  @service flashMessages;
  @service permissionChecker;
  @service dataLoader;

  @tracked selectedYear;
  @tracked selectedCourseId;

  @cached
  get allCoursesData() {
    return new TrackedAsyncData(this.loadCourses(this.args.session));
  }

  get allCourses() {
    return this.allCoursesData.isResolved ? this.allCoursesData.value : [];
  }

  @cached
  get yearsData() {
    return new TrackedAsyncData(this.dataLoader.loadAcademicYears());
  }

  get years() {
    const { year: thisYear } = DateTime.now();
    return this.yearsData.value
      .map((year) => Number(year.id))
      .filter((year) => year >= thisYear - 1)
      .sort();
  }

  async loadCourses(session) {
    if (!session) {
      return;
    }
    const course = await session.course;
    const school = await course.school;
    await this.dataLoader.loadSchoolForCourses(school.id);

    const allCourses = this.store.peekAll('course');
    const schoolCourses = allCourses.filter((c) => c.belongsTo('school').id() === school.id);
    return await filter(schoolCourses, async (co) => {
      return this.permissionChecker.canCreateSession(co);
    });
  }

  get bestSelectedYear() {
    if (this.selectedYear) {
      return this.selectedYear;
    }

    return this.years[0];
  }

  get courses() {
    if (!this.allCourses) {
      return null;
    }
    return sortBy(
      this.allCourses.filter((course) => course.year === this.bestSelectedYear),
      'title',
    );
  }

  get bestSelectedCourse() {
    if (this.selectedCourseId) {
      const course = findById(this.courses, this.selectedCourseId);
      if (course) {
        return course;
      }
    }

    return this.courses[0];
  }

  @action
  changeSelectedYear(event) {
    this.selectedCourseId = null;
    this.selectedYear = Number(event.target.value);
  }

  @action
  changeSelectedCourseId(event) {
    this.selectedCourseId = event.target.value;
  }

  save = task({ drop: true }, async () => {
    await timeout(10);
    const sessionToCopy = this.args.session;
    const newCourse = this.bestSelectedCourse;
    const toSave = [];

    const session = this.store.createRecord(
      'session',
      sessionToCopy.getProperties(
        'title',
        'description',
        'attireRequired',
        'equipmentRequired',
        'supplemental',
        'attendanceRequired',
        'instructionalNotes',
      ),
    );

    session.set('course', newCourse);
    session.set('meshDescriptors', await sessionToCopy.meshDescriptors);
    session.set('terms', await sessionToCopy.terms);
    session.set('sessionType', await sessionToCopy.sessionType);

    const ilmToCopy = await sessionToCopy.ilmSession;
    if (ilmToCopy) {
      const ilm = this.store.createRecord(
        'ilm-session',
        ilmToCopy.getProperties('hours', 'dueDate'),
      );
      ilm.set('session', session);
      toSave.push(ilm);
    }

    const learningMaterialsToCopy = await sessionToCopy.learningMaterials;
    for (let i = 0; i < learningMaterialsToCopy.length; i++) {
      const learningMaterialToCopy = learningMaterialsToCopy.slice()[i];
      const lm = await learningMaterialToCopy.learningMaterial;
      const learningMaterial = this.store.createRecord(
        'session-learning-material',
        learningMaterialToCopy.getProperties('notes', 'required', 'publicNotes', 'position'),
      );
      learningMaterial.set('learningMaterial', lm);
      learningMaterial.set('session', session);
      toSave.push(learningMaterial);
    }

    const originalCourse = await sessionToCopy.course;
    if (newCourse.id === originalCourse.id) {
      const postrequisiteToCopy = await sessionToCopy.postrequisite;
      session.set('postrequisite', postrequisiteToCopy);
    }

    // save the session first to fill out relationships with the session id
    await session.save();
    await await all(toSave.map((o) => o.save()));

    //parse objectives last because it is a many2many relationship
    //and ember data tries to save it too soon
    const relatedSessionObjectives = await sessionToCopy.sessionObjectives;
    const sessionObjectivesToCopy = sortBy(relatedSessionObjectives, 'id');
    for (let i = 0, n = sessionObjectivesToCopy.length; i < n; i++) {
      const sessionObjectiveToCopy = sessionObjectivesToCopy[i];
      const meshDescriptors = await sessionObjectiveToCopy.meshDescriptors;
      const terms = await sessionObjectiveToCopy.terms;
      const sessionObjective = this.store.createRecord('session-objective', {
        session,
        position: sessionObjectiveToCopy.position,
        title: sessionObjectiveToCopy.title,
      });
      sessionObjective.set('meshDescriptors', meshDescriptors);
      sessionObjective.set('terms', terms);
      await sessionObjective.save();
    }
    this.flashMessages.success('general.copySuccess');
    return this.args.visit(session);
  });
  <template>
    <div class="session-copy">
      {{#if (and this.allCoursesData.isResolved this.yearsData.isResolved)}}
        {{#let (uniqueId) as |templateId|}}
          <div class="backtolink">
            <LinkTo @route="session" @model={{@session}}>
              {{t "general.backToTitle" title=@session.title}}
            </LinkTo>
          </div>
          <div class="copy-form">
            <h3 class="title">
              {{t "general.copySession"}}
            </h3>
            <p class="rollover-summary">
              {{t "general.copySessionSummary"}}
            </p>
            {{#if (and (isArray this.years) (isArray this.courses))}}
              <div class="item year-select">
                <label for="year-{{templateId}}">
                  {{t "general.year"}}:
                </label>
                <select id="year-{{templateId}}" {{on "change" this.changeSelectedYear}}>
                  {{#each this.years as |year|}}
                    <option value={{year}} selected={{isEqual year this.bestSelectedYear}}>
                      {{year}}
                      -
                      {{add year 1}}
                    </option>
                  {{/each}}
                </select>
              </div>
              <div class="item course-select">
                <label for="course-{{templateId}}">
                  {{t "general.targetCourse"}}:
                </label>
                {{#if (get this.courses "length")}}
                  <select id="course-{{templateId}}" {{on "change" this.changeSelectedCourseId}}>
                    {{#each (sortBy0 "title" this.courses) as |course|}}
                      <option
                        value={{course.id}}
                        selected={{isEqual course.id this.bestSelectedCourse.id}}
                      >
                        {{course.title}}
                      </option>
                    {{/each}}
                  </select>
                {{else}}
                  {{t "general.none"}}
                {{/if}}
              </div>
              <div class="buttons">
                <button
                  class="done text"
                  type="button"
                  disabled={{if
                    (or
                      this.save.isRunning (not this.bestSelectedYear) (not this.bestSelectedCourse)
                    )
                    true
                  }}
                  {{on "click" (perform this.save)}}
                  data-test-save
                >
                  {{#if this.save.isRunning}}
                    <LoadingSpinner />
                  {{else}}
                    {{t "general.done"}}
                  {{/if}}
                </button>
                <LinkTo @route="session" @model={{@session}}>
                  <button class="cancel text" type="button" {{scrollIntoView delay=10}}>
                    {{t "general.cancel"}}
                  </button>
                </LinkTo>
              </div>
            {{else}}
              <LoadingSpinner />
            {{/if}}
          </div>
        {{/let}}
      {{/if}}
    </div>
  </template>
}
