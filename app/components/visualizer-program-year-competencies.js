/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { map } from 'rsvp';
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
    const i18n = this.get('i18n');
    const programYear = this.get('programYear');
    const cohort = await programYear.get('cohort');
    const title = cohort.get('title');
    const classOfYear = i18n.t('classOfYear', { year: programYear.get('classOfYear') });

    return title ? title : classOfYear;
  }),
  data: computed('programYear.objectives.[]', async function(){
    const programYear = this.get('programYear');
    const name = await this.get('programYearName');
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
    const objectiveObjects = await map(objectives.toArray(), async objective => {
      const obj = await buildTree(objective);
      const competency = await objective.get('competency');
      const domain = await competency.get('domain');

      obj.domainId = domain.get('id');
      obj.domainTitle = domain.get('title');
      obj.competencyId = competency.get('id');
      obj.competencyTitle = competency.get('title');

      return obj;
    });

    const competencyObjects = objectiveObjects.reduce((set, obj) => {
      let existing = set.findBy('competencyId', obj.competencyId);
      if (!existing) {
        existing = {
          children: [],
          name: obj.competencyTitle,
          competencyId: obj.competencyId,
          domainId: obj.domainId,
          domainTitle: obj.domainTitle,
          meta: {
            courseTitles: [],
            sessionTitles: [],
          }
        };
        set.pushObject(existing);
      }
      existing.children.pushObject(obj);

      return set;
    }, []);

    const children = competencyObjects.reduce((set, obj) => {
      let existing = set.findBy('domainId', obj.meta.domainId);
      if (!existing) {
        existing = {
          children: [],
          name: obj.domainTitle,
          meta: obj.meta
        };
        set.pushObject(existing);
      }
      //if the domain and the competency are the same
      if (obj.meta.id === obj.meta.domainId) {
        existing.children.pushObjects(obj.children);
      } else {
        existing.children.pushObject(obj);
      }

      return set;
    }, []);

    return {
      name,
      children
    };
  }),
  nodeHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipCourses', null);
      this.set('tooltipSessions', null);
      return;
    }
    const { name, children, meta } = obj;

    const getCourseTitles = (courseTitles, {children, meta}) => {
      courseTitles.pushObjects(meta.courseTitles);

      return children.reduce(getCourseTitles, courseTitles);
    };
    const allCourseTitles = children.reduce(getCourseTitles, meta.courseTitles);
    const getSessionTitles = (sessionTitles, {children, meta}) => {
      sessionTitles.pushObjects(meta.sessionTitles);

      return children.reduce(getSessionTitles, sessionTitles);
    };
    const allSessionTitles = children.reduce(getSessionTitles, meta.sessionTitles);

    this.set('tooltipTitle', htmlSafe(name));
    this.set('tooltipCourses', allCourseTitles.uniq().sort());
    this.set('tooltipSessions', allSessionTitles.uniq().sort());
  }).restartable()
});
