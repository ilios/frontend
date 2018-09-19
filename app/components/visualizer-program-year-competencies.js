/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { filter, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  programYear: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-program-year-competencies'],
  tooltipCourses: null,
  tooltipSessions: null,
  tooltipTitle: null,
  programYearName: computed('programYear.acdemicYear', 'programYear.cohort.{title,classOfYear}', async function(){
    const i18n = this.i18n;
    const programYear = this.programYear;
    const cohort = await programYear.get('cohort');
    const title = cohort.get('title');
    const year = await cohort.get('classOfYear');
    const classOfYear = i18n.t('classOfYear', { year });

    return title ? title : classOfYear;
  }),
  objectiveObjects: computed('programYear.objectives.[]', async function () {
    const programYear = this.programYear;
    const buildTree = async function (parent) {
      const children = await parent.get('children');
      const childrenTree = await map(children.toArray(), buildTree);
      const courses = await parent.get('courses');
      const sessions = await parent.get('sessions');
      const courseTitles = courses.mapBy('title');
      const sessionTitles = sessions.mapBy('title');

      const rhett = {
        name: parent.get('title'),
        children: childrenTree,
        meta: {
          courseTitles,
          sessionTitles
        }
      };

      return rhett;
    };
    const objectives = await programYear.get('objectives');
    const objectivesWithCompetency = await filter(objectives.toArray(), async objective => {
      const competency = await objective.get('competency');
      return !!competency;
    });
    const objectiveObjects = await map(objectivesWithCompetency, async objective => {
      const obj = await buildTree(objective);
      const competency = await objective.get('competency');
      obj.competencyId = competency.get('id');

      return obj;
    });

    return objectiveObjects;
  }),
  competencyObjects: computed('programYear.competencies.[]', 'objectiveObjects.[]', async function () {
    const programYear = this.programYear;
    const objectiveObjects = await this.objectiveObjects;
    const competencies = await programYear.get('competencies');
    const competencyObjects = await map(competencies.toArray(), async competency => {
      const domain = await competency.get('domain');

      const domainId = domain.get('id');
      const competencyId = competency.get('id');
      const competencyTitle = competency.get('title');
      return {
        domainId,
        name: competencyTitle,
        children: objectiveObjects.filterBy('competencyId', competencyId)
      };
    });

    return competencyObjects;
  }),
  domainObjects: computed('programYear.competencies.[]', 'competencyObjects.[]', async function () {
    const programYear = this.programYear;
    const competencies = await programYear.get('competencies');
    const competencyObjects = await this.competencyObjects;
    const domains = await map(competencies.toArray(), async competency => competency.get('domain'));

    const domainObjects = domains.uniq().map(domain => {
      const id = domain.get('id');
      const name = domain.get('title');
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

    return domainObjects;
  }),

  data: computed('domainObjects.[]', async function () {
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
      courseTitles.pushObjects(meta.courseTitles || []);

      return children.reduce(getCourseTitles, courseTitles);
    };
    const allCourseTitles = children.reduce(getCourseTitles, meta.courseTitles || []);
    const getSessionTitles = (sessionTitles, {children, meta}) => {
      sessionTitles.pushObjects(meta.sessionTitles || []);

      return children.reduce(getSessionTitles, sessionTitles);
    };
    const allSessionTitles = children.reduce(getSessionTitles, meta.sessionTitles || []);

    this.set('tooltipTitle', htmlSafe(name));
    this.set('tooltipCourses', allCourseTitles.uniq());
    this.set('tooltipSessions', allSessionTitles.uniq());
  }).restartable()
});
