import Model, { hasMany, belongsTo, attr } from '@ember-data/model';
import sortableByPosition from 'ilios-common/utils/sortable-by-position';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { map } from 'rsvp';
import { DateTime } from 'luxon';
import { sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class Course extends Model {
  @attr('string')
  title;

  @attr('number')
  level;

  @attr('number')
  year;

  @attr('date')
  startDate;

  @attr('date')
  endDate;

  @attr('string')
  externalId;

  @attr('boolean')
  locked;

  @attr('boolean')
  archived;

  @attr('boolean')
  publishedAsTbd;

  @attr('boolean')
  published;

  @belongsTo('course-clerkship-type', { async: true, inverse: 'courses' })
  clerkshipType;

  @belongsTo('school', { async: true, inverse: 'courses' })
  school;

  @cached
  get _schoolData() {
    return new TrackedAsyncData(this.school);
  }

  @hasMany('user', {
    async: true,
    inverse: 'directedCourses',
  })
  directors;

  @hasMany('user', {
    async: true,
    inverse: 'administeredCourses',
  })
  administrators;

  @hasMany('user', {
    async: true,
    inverse: 'studentAdvisedCourses',
  })
  studentAdvisors;

  @hasMany('cohort', { async: true, inverse: 'courses' })
  cohorts;

  @cached
  get _cohortsData() {
    return new TrackedAsyncData(this.cohorts);
  }

  @hasMany('course-objective', { async: true, inverse: 'course' })
  courseObjectives;

  @cached
  get _courseObjectivesData() {
    return new TrackedAsyncData(this.courseObjectives);
  }

  @hasMany('mesh-descriptor', { async: true, inverse: 'courses' })
  meshDescriptors;

  @hasMany('course-learning-material', { async: true, inverse: 'course' })
  learningMaterials;

  @hasMany('session', { async: true, inverse: 'course' })
  sessions;

  @cached
  get _sessionsData() {
    return new TrackedAsyncData(this.sessions);
  }

  @belongsTo('course', {
    inverse: 'descendants',
    async: true,
  })
  ancestor;

  @hasMany('course', {
    inverse: 'ancestor',
    async: true,
  })
  descendants;

  @hasMany('term', { async: true, inverse: 'courses' })
  terms;

  @cached
  get _termsData() {
    return new TrackedAsyncData(this.terms);
  }

  @cached
  get _publishedSessionOfferings() {
    if (!this._sessionsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(
      Promise.all(this._sessionsData.value.filter((s) => s.isPublished).map((s) => s.offerings)),
    );
  }

  @cached
  get publishedOfferingCount() {
    if (!this._publishedSessionOfferings?.isResolved) {
      return 0;
    }
    return uniqueValues(this._publishedSessionOfferings.value.flat()).length;
  }

  get allTreeCompetencies() {
    if (!this._courseObjectivesData.isResolved) {
      return null;
    }
    return this._courseObjectivesData.value.map((co) => co.treeCompetencies);
  }

  get competencies() {
    if (!this._courseObjectivesData.isResolved) {
      return [];
    }

    const treeCompetencies = this._courseObjectivesData.value.map((o) => o.treeCompetencies);

    return uniqueValues(treeCompetencies.flat()).filter(Boolean);
  }

  @cached
  get _competencyDomains() {
    return new TrackedAsyncData(Promise.all(this.competencies?.map((c) => c.getDomain())));
  }

  @cached
  get _unsortedDomainsWithSubcompetencies() {
    if (!this._competencyDomains.isResolved || this.competencies === null) {
      return null;
    }

    return new TrackedAsyncData(
      map(uniqueValues(this._competencyDomains.value), async (domain) => {
        let subCompetencies = (await domain.children).filter((competency) => {
          return this.competencies.includes(competency);
        });

        subCompetencies = sortBy(subCompetencies, 'title');

        return {
          title: domain.title,
          id: domain.id,
          subCompetencies,
        };
      }),
    );
  }

  get domainsWithSubcompetencies() {
    if (
      !this._unsortedDomainsWithSubcompetencies ||
      !this._unsortedDomainsWithSubcompetencies.isResolved
    ) {
      return [];
    }

    return sortBy(this._unsortedDomainsWithSubcompetencies.value, 'title');
  }

  get requiredPublicationIssues() {
    const issues = [];
    if (!this.startDate) {
      issues.push('startDate');
    }
    if (!this.endDate) {
      issues.push('endDate');
    }

    if (!this.cohorts.length) {
      issues.push('cohorts');
    }

    return issues;
  }

  get optionalPublicationIssues() {
    const issues = [];
    if (!this.terms.length) {
      issues.push('terms');
    }
    if (!this.courseObjectives.length) {
      issues.push('courseObjectives');
    }
    if (!this.meshDescriptors.length) {
      issues.push('meshDescriptors');
    }

    return issues;
  }

  @cached
  get _programSchoolsData() {
    if (!this._cohortsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(
      map(this._cohortsData.value, async (cohort) => {
        const programYear = await cohort.programYear;
        const program = await programYear.program;
        return program.school;
      }),
    );
  }

  get schools() {
    if (!this._programSchoolsData?.isResolved || !this._schoolData.isResolved) {
      return [];
    }

    return uniqueValues([...this._programSchoolsData.value, this._schoolData.value]);
  }

  @cached
  get _schoolVocabulariesData() {
    return new TrackedAsyncData(Promise.all(this.schools.map((s) => s.vocabularies)));
  }

  get assignableVocabularies() {
    if (!this._schoolVocabulariesData?.isResolved) {
      return [];
    }
    return sortBy(this._schoolVocabulariesData.value.flat(), ['school.title', 'title']);
  }

  /**
   * A list of course objectives, sorted by position (asc) and then id (desc).
   */
  get sortedCourseObjectives() {
    if (!this._courseObjectivesData.isResolved) {
      return null;
    }
    return this._courseObjectivesData.value.toSorted(sortableByPosition);
  }

  get hasMultipleCohorts() {
    return this.cohorts.length > 1;
  }

  @cached
  get _termVocabularies() {
    if (!this._termsData.isResolved) {
      return null;
    }

    return new TrackedAsyncData(Promise.all(this._termsData.value.map((t) => t.vocabulary)));
  }
  /**
   * A list of all vocabularies that are associated via terms.
   */
  get associatedVocabularies() {
    if (!this._termVocabularies?.isResolved) {
      return [];
    }
    return sortBy(uniqueValues(this._termVocabularies.value), 'title');
  }

  get termCount() {
    return this.hasMany('terms').ids().length;
  }

  setDatesBasedOnYear() {
    const today = DateTime.now();
    const firstDayOfYear = DateTime.fromObject({
      year: this.year,
      month: 7,
      day: 1,
    });
    const startDate = today < firstDayOfYear ? firstDayOfYear : today;
    const endDate = startDate.plus({ weeks: 8 });
    this.startDate = startDate.toJSDate();
    this.endDate = endDate.toJSDate();
  }

  get xObjectives() {
    return this.courseObjectives;
  }

  get isPublished() {
    return this.published;
  }

  get isNotPublished() {
    return !this.isPublished;
  }

  get isScheduled() {
    return this.publishedAsTbd;
  }

  get isPublishedOrScheduled() {
    return this.publishedAsTbd || this.isPublished;
  }

  get allPublicationIssuesLength() {
    return this.requiredPublicationIssues.length + this.optionalPublicationIssues.length;
  }
}
