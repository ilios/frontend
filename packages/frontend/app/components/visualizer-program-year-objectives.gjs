import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { task, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { filterBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { or } from 'ember-truth-helpers';
import SimpleChart from 'ember-simple-charts/components/simple-chart';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import truncate from 'ilios-common/helpers/truncate';
import join from 'ilios-common/helpers/join';

export default class VisualizerProgramYearObjectivesComponent extends Component {
  @service intl;

  @tracked tooltipCourses;
  @tracked tooltipSessions;
  @tracked tooltipTitle;

  @cached
  get chartOutputData() {
    return new TrackedAsyncData(this.loadData(this.args.programYear));
  }

  get chartOutput() {
    return this.chartOutputData.isResolved ? this.chartOutputData.value : null;
  }

  async loadData(programYear) {
    const cohort = await programYear.cohort;
    const year = await programYear.getClassOfYear();
    const classOfYear = this.intl.t('general.classOf', { year });
    const programYearName = cohort.title ?? classOfYear;

    return {
      name: programYearName,
      children: await this.getDomainObjects(programYear),
      meta: {},
    };
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

  nodeHover = task({ restartable: true }, async (obj) => {
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
  <template>
    <div class="{{unless @isIcon 'not-icon'}} visualizer-program-year-objectives" ...attributes>
      {{#if this.chartOutputData.isResolved}}
        {{#if (or @isIcon this.chartOutput)}}
          <SimpleChart
            @name="tree"
            @isIcon={{@isIcon}}
            @data={{this.chartOutput}}
            @hover={{perform this.nodeHover}}
            @leave={{perform this.nodeHover}}
            as |chart|
          >
            {{#if this.tooltipTitle}}
              <chart.tooltip @title={{this.tooltipTitle}}>
                <div>
                  <h5>
                    {{t "general.courses"}}
                    ({{this.tooltipCourses.length}})
                  </h5>
                  {{truncate (join ", " this.tooltipCourses) 200 true}}
                </div>
                <div>
                  <h5>
                    {{t "general.sessions"}}
                    ({{this.tooltipSessions.length}})
                  </h5>
                  {{truncate (join ", " this.tooltipSessions) 200 true}}
                </div>
              </chart.tooltip>
            {{/if}}
          </SimpleChart>
        {{/if}}
      {{/if}}
    </div>
  </template>
}
