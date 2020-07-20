import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import { isEmpty } from '@ember/utils';
import { filter, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  intl: service(),

  tagName: "",

  isIcon: false,
  programYear: null,
  tooltipCourses: null,
  tooltipSessions: null,
  tooltipTitle: null,

  programYearName: computed('programYear.academicYear', 'programYear.cohort.{title,classOfYear}', async function() {
    const intl = this.intl;
    const programYear = this.programYear;
    const cohort = await programYear.cohort;
    const title = cohort.title;
    const year = await cohort.classOfYear;
    const classOfYear = intl.t('general.classOf', { year });
    return title ? title : classOfYear;
  }),

  objectiveObjects: computed('programYear.programYearObjectives.[]', async function() {
    const programYear = this.programYear;
    const buildTreeLevel = async function (parent, childrenTree, sessionTitle, courseTitle) {
      return  {
        name: parent.title,
        children: childrenTree,
        meta: {
          courseTitle,
          sessionTitle
        }
      };
    };
    const buildTree = async function (programYearObjective) {
      const courseObjectives = await programYearObjective.courseObjectives;
      const courseObjectivesTree = await map(courseObjectives.toArray(), async courseObjective => {
        const sessionObjectives = await courseObjective.sessionObjectives;
        const sessionObjectivesTree = await map(sessionObjectives.toArray(), async sessionObjective => {
          const session = await sessionObjective.session;
          return buildTreeLevel(sessionObjective, [], session.title, null);
        });
        const course = await courseObjective.course;
        return buildTreeLevel(courseObjective, sessionObjectivesTree, null, course.title);
      });
      return buildTreeLevel(programYearObjective, courseObjectivesTree, null, null);
    };
    const objectives = await programYear.programYearObjectives;
    const objectivesWithCompetency = await filter(objectives.toArray(), async objective => {
      const competency = await objective.competency;
      return !!competency;
    });
    return await map(objectivesWithCompetency, async objective => {
      const obj = await buildTree(objective);
      const competency = await objective.competency;
      obj.competencyId = competency.id;
      return obj;
    });
  }),

  competencyObjects: computed('programYear.competencies.[]', 'objectiveObjects.[]', async function() {
    const programYear = this.programYear;
    const objectiveObjects = await this.objectiveObjects;
    const competencies = await programYear.competencies;
    return await map(competencies.toArray(), async competency => {
      const domain = await competency.domain;

      const domainId = domain.id;
      const competencyId = competency.id;
      const competencyTitle = competency.title;
      return {
        domainId,
        name: competencyTitle,
        children: objectiveObjects.filterBy('competencyId', competencyId)
      };
    });
  }),

  domainObjects: computed('programYear.competencies.[]', 'competencyObjects.[]', async function() {
    const programYear = this.programYear;
    const competencies = await programYear.competencies;
    const competencyObjects = await this.competencyObjects;
    const domains = await map(competencies.toArray(), async competency => competency.domain);
    return domains.uniq().map(domain => {
      const id = domain.id;
      const name = domain.title;
      const domainCompetencyObjects = competencyObjects.filterBy('domainId', id);

      const children = domainCompetencyObjects.reduce((arr, { domainId, name, children }) => {
        if (id === domainId) {
          arr.pushObjects(children);
        } else {
          arr.pushObject({ name, children });
        }

        return arr;
      }, []);

      return {
        name,
        children,
        meta: {}
      };
    });
  }),

  data: computed('domainObjects.[]', async function() {
    const name = await this.programYearName;
    const children = await this.domainObjects;
    return {
      name,
      children,
      meta: {}
    };
  }),

  nodeHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.isIcon;
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipCourses', null);
      this.set('tooltipSessions', null);
      return;
    }
    const { name, children, meta } = obj;

    const getCourseTitles = (courseTitles, {children, meta}) => {
      if (meta.courseTitle) {
        courseTitles.pushObject(meta.courseTitle);
      }
      return children.reduce(getCourseTitles, courseTitles);
    };
    const allCourseTitles = children.reduce(getCourseTitles, meta.courseTitles || []);
    const getSessionTitles = (sessionTitles, {children, meta}) => {
      if (meta.sessionTitle) {
        sessionTitles.pushObject(meta.sessionTitle);
      }
      return children.reduce(getSessionTitles, sessionTitles);
    };
    const allSessionTitles = children.reduce(getSessionTitles, meta.sessionTitles || []);

    this.set('tooltipTitle', htmlSafe(name));
    this.set('tooltipCourses', allCourseTitles.uniq());
    this.set('tooltipSessions', allSessionTitles.uniq());
  }).restartable()
});
