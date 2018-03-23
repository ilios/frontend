/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

const { map, filter } = RSVP;

export default Component.extend({
  i18n: service(),
  course: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-objectives'],
  tagName: 'div',
  tooltipContent: null,
  tooltipTitle: null,
  objectiveData: computed('course.sessions.[]', 'course.objectives.[]', async function(){
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const sessionCourseObjectiveMap = await map(sessions.toArray(), async session => {
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const sessionObjectives = await session.get('objectives');
      const sessionObjectivesWithParents = await filter(sessionObjectives.toArray(), async sessionObjective => {
        const parents = await sessionObjective.get('parents');
        return isPresent(parents);
      });
      const courseSessionObjectives = await map(sessionObjectivesWithParents.toArray(), async sessionObjective => {
        const parents = await sessionObjective.get('parents');
        return parents.mapBy('id');
      });
      let flatObjectives = courseSessionObjectives.reduce((flattened, obj) => {
        return flattened.pushObjects(obj.toArray());
      }, []);

      return {
        sessionTitle: session.get('title'),
        objectives: flatObjectives,
        minutes
      };

    });


    return sessionCourseObjectiveMap;
  }),

  condensedObjectiveData: computed('objectiveData.[]', async function (){
    const course = this.get('course');
    const sessionCourseObjectiveMap  = await this.get('objectiveData');
    const courseObjectives = await course.get('objectives');
    let mappedObjectives = courseObjectives.map(courseObjective => {
      const minutes = sessionCourseObjectiveMap.map(obj => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.minutes;
        } else {
          return 0;
        }
      });
      const sessionObjectives = sessionCourseObjectiveMap.filter(obj => obj.objectives.includes(courseObjective.get('id')));
      const meta = {
        courseObjective,
        sessionObjectives
      };
      const data = minutes.reduce((accumulator, current) => accumulator + parseInt(current, 10), 0);

      return {
        data,
        meta
      };
    });

    const totalMinutes = mappedObjectives.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedObjectivesWithLabel = mappedObjectives.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });

    return mappedObjectivesWithLabel;
  }),

  objectiveWithMinutes: computed('condensedObjectiveData.[]', async function(){
    const condensedObjectiveData = await this.get('condensedObjectiveData');
    const objectiveWithMinutes = condensedObjectiveData.filter(obj => obj.data !== 0);

    return objectiveWithMinutes;
  }),

  objectiveWithoutMinutes: computed('condensedObjectiveData.[]', async function(){
    const condensedObjectiveData = await this.get('condensedObjectiveData');
    const objectiveWithoutMinutes = condensedObjectiveData.filterBy('data', 0);

    return objectiveWithoutMinutes;
  }),

  async getTooltipData(obj){
    const i18n = this.get('i18n');
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return '';
    }
    const { data, meta } = obj;

    let objectiveTitle = meta.courseObjective.get('title');
    let competency = await meta.courseObjective.get('competency');
    if (competency) {
      objectiveTitle += `(${competency})`;
    }

    const title = htmlSafe(`${objectiveTitle} &bull; ${data} ${i18n.t('general.minutes')}`);
    const sessionTitles = meta.sessionObjectives.mapBy('sessionTitle');
    const content = sessionTitles.join(', ');

    return {
      content,
      title
    };
  },
  donutHover: task(function* (obj) {
    yield timeout(100);
    const data = yield this.getTooltipData(obj);
    if (isPresent(data)) {
      this.set('tooltipTitle', data.title);
      this.set('tooltipContent', data.content);
    }
  }).restartable(),
});
