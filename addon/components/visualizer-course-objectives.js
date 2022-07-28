import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class VisualizerCourseObjectives extends Component {
  @service router;
  @service intl;
  @service dataLoader;

  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use courseSessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use dataObjects = new AsyncProcess(() => [this.getDataObjects.bind(this), this.sessions]);

  get sessions() {
    if (!this.courseSessions) {
      return [];
    }

    return this.courseSessions.toArray();
  }

  get objectiveWithMinutes() {
    return this.dataObjects?.filter((obj) => obj.data !== 0);
  }

  get objectiveWithoutMinutes() {
    return this.dataObjects?.filterBy('data', 0);
  }

  get isLoaded() {
    return !!this.dataObjects;
  }

  async getDataObjects(sessions) {
    if (!sessions) {
      return [];
    }

    const sessionsWithMinutes = sessions.map(async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const sessionCourseObjectiveMap = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const sessionObjectives = await session.sessionObjectives;
        const sessionObjectivesWithParents = await filter(
          sessionObjectives.toArray(),
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return parents.length;
          }
        );
        const courseSessionObjectives = await map(
          sessionObjectivesWithParents,
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return parents.mapBy('id');
          }
        );
        const flatObjectives = courseSessionObjectives.reduce((flattened, obj) => {
          return flattened.pushObjects(obj.toArray());
        }, []);

        return {
          sessionTitle: session.title,
          objectives: flatObjectives,
          minutes,
        };
      }
    );

    // condensed objectives map
    const courseObjectives = await this.args.course.courseObjectives;
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

    return mappedObjectives.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
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
