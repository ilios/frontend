import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { filterBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class VisualizerProgramYearObjectivesComponent extends Component {
  @service intl;

  @tracked tooltipCourses;
  @tracked tooltipSessions;
  @tracked tooltipTitle;

  @tracked programYearName;
  @tracked data;

  constructor() {
    super(...arguments);
    this.load.perform();
  }

  load = restartableTask(async () => {
    const cohort = await this.programYear.cohort;
    const year = await this.programYear.getClassOfYear();
    const classOfYear = this.intl.t('general.classOf', { year });
    this.programYearName = cohort.title ?? classOfYear;

    this.data = await this.getData(this.programYear);
  });

  @cached
  get programYearData() {
    return new TrackedAsyncData(this.args.programYear);
  }

  get programYear() {
    return this.programYearData.isResolved ? this.programYearData.value : null;
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
      const courseObjectivesTree = await map(courseObjectives, async (courseObjective) => {
        const sessionObjectives = await courseObjective.sessionObjectives;
        const sessionObjectivesTree = await map(sessionObjectives, async (sessionObjective) => {
          const session = await sessionObjective.session;
          return buildTreeLevel(sessionObjective, [], session.title, null);
        });
        const course = await courseObjective.course;
        return buildTreeLevel(courseObjective, sessionObjectivesTree, null, course.title);
      });
      return buildTreeLevel(programYearObjective, courseObjectivesTree, null, null);
    };
    const objectives = await programYear.programYearObjectives;
    const objectivesWithCompetency = await filter(objectives, async (objective) => {
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
    return await map(competencies, async (competency) => {
      const domain = await competency.getDomain();

      const domainId = domain.id;
      const competencyId = competency.id;
      const competencyTitle = competency.title;
      return {
        domainId,
        name: competencyTitle,
        children: filterBy(objectiveObjects, 'competencyId', competencyId),
      };
    });
  }

  async getDomainObjects(programYear) {
    const competencies = await programYear.competencies;
    const competencyObjects = await this.getCompetencyObjects(programYear);
    const domains = await map(competencies, async (competency) => competency.getDomain());
    return uniqueValues(domains).map((domain) => {
      const id = domain.id;
      const name = domain.title;
      const domainCompetencyObjects = filterBy(competencyObjects, 'domainId', id);

      const children = domainCompetencyObjects.reduce((arr, { domainId, name, children }) => {
        if (id === domainId) {
          arr = [...arr, ...children];
        } else {
          arr.push({ name, children });
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

  nodeHover = restartableTask(async (obj) => {
    await timeout(100);
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
        courseTitles.push(meta.courseTitle);
      }
      return children.reduce(getCourseTitles, courseTitles);
    };
    const allCourseTitles = children.reduce(getCourseTitles, meta.courseTitles || []);
    const getSessionTitles = (sessionTitles, { children, meta }) => {
      if (meta.sessionTitle) {
        sessionTitles.push(meta.sessionTitle);
      }
      return children.reduce(getSessionTitles, sessionTitles);
    };
    const allSessionTitles = children.reduce(getSessionTitles, meta.sessionTitles || []);

    this.tooltipTitle = htmlSafe(name);
    this.tooltipCourses = uniqueValues(allCourseTitles);
    this.tooltipSessions = uniqueValues(allSessionTitles);
  });
}
