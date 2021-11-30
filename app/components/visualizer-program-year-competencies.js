import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class VisualizerProgramYearCompetenciesComponent extends Component {
  @service intl;

  @tracked tooltipCourses;
  @tracked tooltipSessions;
  @tracked tooltipTitle;

  @tracked programYearName;
  @tracked data;

  @restartableTask
  *load(element, [programYear]) {
    const cohort = yield programYear.cohort;
    const year = yield programYear.getClassOfYear();
    const classOfYear = this.intl.t('general.classOf', { year });
    this.programYearName = cohort.title ?? classOfYear;

    this.data = yield this.getData(programYear);
  }

  async getObjectiveObjects(programYear) {
    const buildTreeLevel = async function (parent, childrenTree, sessionTitle, courseTitle) {
      return {
        name: parent.title,
        children: childrenTree,
        meta: {
          courseTitle,
          sessionTitle,
        },
      };
    };
    const buildTree = async function (programYearObjective) {
      const courseObjectives = await programYearObjective.courseObjectives;
      const courseObjectivesTree = await map(
        courseObjectives.toArray(),
        async (courseObjective) => {
          const sessionObjectives = await courseObjective.sessionObjectives;
          const sessionObjectivesTree = await map(
            sessionObjectives.toArray(),
            async (sessionObjective) => {
              const session = await sessionObjective.session;
              return buildTreeLevel(sessionObjective, [], session.title, null);
            }
          );
          const course = await courseObjective.course;
          return buildTreeLevel(courseObjective, sessionObjectivesTree, null, course.title);
        }
      );
      return buildTreeLevel(programYearObjective, courseObjectivesTree, null, null);
    };
    const objectives = await programYear.programYearObjectives;
    const objectivesWithCompetency = await filter(objectives.toArray(), async (objective) => {
      const competency = await objective.competency;
      return !!competency;
    });
    return await map(objectivesWithCompetency, async (objective) => {
      const obj = await buildTree(objective);
      const competency = await objective.competency;
      obj.competencyId = competency.id;
      return obj;
    });
  }

  async getCompetencyObjects(programYear) {
    const objectiveObjects = await this.getObjectiveObjects(programYear);
    const competencies = await programYear.competencies;
    return await map(competencies.toArray(), async (competency) => {
      const domain = await competency.domain;

      const domainId = domain.id;
      const competencyId = competency.id;
      const competencyTitle = competency.title;
      return {
        domainId,
        name: competencyTitle,
        children: objectiveObjects.filterBy('competencyId', competencyId),
      };
    });
  }

  async getDomainObjects(programYear) {
    const competencies = await programYear.competencies;
    const competencyObjects = await this.getCompetencyObjects(programYear);
    const domains = await map(competencies.toArray(), async (competency) => competency.domain);
    return domains.uniq().map((domain) => {
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
        meta: {},
      };
    });
  }

  async getData(programYear) {
    return {
      name: this.programYearName,
      children: await this.getDomainObjects(programYear),
      meta: {},
    };
  }

  @restartableTask
  *nodeHover(obj) {
    yield timeout(100);
    const isIcon = this.isIcon;
    if (isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipCourses = null;
      this.tooltipSessions = null;
      return;
    }
    const { name, children, meta } = obj;

    const getCourseTitles = (courseTitles, { children, meta }) => {
      if (meta.courseTitle) {
        courseTitles.pushObject(meta.courseTitle);
      }
      return children.reduce(getCourseTitles, courseTitles);
    };
    const allCourseTitles = children.reduce(getCourseTitles, meta.courseTitles || []);
    const getSessionTitles = (sessionTitles, { children, meta }) => {
      if (meta.sessionTitle) {
        sessionTitles.pushObject(meta.sessionTitle);
      }
      return children.reduce(getSessionTitles, sessionTitles);
    };
    const allSessionTitles = children.reduce(getSessionTitles, meta.sessionTitles || []);

    this.tooltipTitle = htmlSafe(name);
    this.tooltipCourses = allCourseTitles.uniq();
    this.tooltipSessions = allSessionTitles.uniq();
  }
}
