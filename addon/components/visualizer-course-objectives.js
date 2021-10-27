import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty, isPresent } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class VisualizerCourseObjectives extends Component {
  @service router;
  @service intl;
  @tracked objectiveWithoutMinutes;
  @tracked objectiveWithMinutes;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @restartableTask
  *load(element, [course]) {
    const sessions = yield course.get('sessions');
    const sessionCourseObjectiveMap = yield map(sessions.toArray(), async (session) => {
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const sessionObjectives = await session.get('sessionObjectives');
      const sessionObjectivesWithParents = await filter(
        sessionObjectives.toArray(),
        async (sessionObjective) => {
          const parents = await sessionObjective.get('courseObjectives');
          return isPresent(parents);
        }
      );
      const courseSessionObjectives = await map(
        sessionObjectivesWithParents,
        async (sessionObjective) => {
          const parents = await sessionObjective.get('courseObjectives');
          return parents.mapBy('id');
        }
      );
      const flatObjectives = courseSessionObjectives.reduce((flattened, obj) => {
        return flattened.pushObjects(obj.toArray());
      }, []);

      return {
        sessionTitle: session.get('title'),
        objectives: flatObjectives,
        minutes,
      };
    });

    // condensed objectives map
    const courseObjectives = yield course.get('courseObjectives');
    const mappedObjectives = courseObjectives.toArray().map((courseObjective) => {
      const minutes = sessionCourseObjectiveMap.map((obj) => {
        if (obj.objectives.includes(courseObjective.get('id'))) {
          return obj.minutes;
        } else {
          return 0;
        }
      });
      const sessionObjectives = sessionCourseObjectiveMap.filter((obj) =>
        obj.objectives.includes(courseObjective.get('id'))
      );
      const meta = {
        courseObjective,
        sessionObjectives,
      };
      const data = minutes.reduce((accumulator, current) => accumulator + parseInt(current, 10), 0);

      return {
        data,
        meta,
      };
    });

    const totalMinutes = mappedObjectives
      .mapBy('data')
      .reduce((total, minutes) => total + minutes, 0);
    const condensedObjectiveData = mappedObjectives.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });

    this.objectiveWithMinutes = condensedObjectiveData.filter((obj) => obj.data !== 0);
    this.objectiveWithoutMinutes = condensedObjectiveData.filterBy('data', 0);
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
    }
    const { data, meta } = obj;

    let objectiveTitle = meta.courseObjective.get('title');
    const competency = yield meta.courseObjective.get('competency');
    if (competency) {
      objectiveTitle += `(${competency})`;
    }

    const title = htmlSafe(`${objectiveTitle} &bull; ${data} ${this.intl.t('general.minutes')}`);
    const sessionTitles = meta.sessionObjectives.mapBy('sessionTitle');
    const content = sessionTitles.join(', ');

    this.tooltipTitle = title;
    this.tooltipContent = content;
  }
}
