import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { filterBy, mapBy } from 'ilios-common/utils/array-helpers';

export default class VisualizerCourseObjectives extends Component {
  @service router;
  @service intl;
  @service dataLoader;

  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'percentage';

  @use courseSessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use dataObjects = new AsyncProcess(() => [this.getDataObjects.bind(this), this.sessions]);

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  get sessions() {
    if (!this.courseSessions) {
      return [];
    }

    return this.courseSessions.slice();
  }

  get tableData() {
    if (!this.dataObjects) {
      return [];
    }
    return this.dataObjects.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.percentage = obj.label;
      rhett.objective = obj.meta.courseObjective.title;
      rhett.competency = obj.meta.competency.title;
      rhett.sessionTitles = mapBy(obj.meta.sessionObjectives, 'sessionTitle').sort().join(', ');
      return rhett;
    });
  }

  get objectiveWithMinutes() {
    return this.dataObjects?.filter((obj) => obj.data !== 0);
  }

  get objectiveWithoutMinutes() {
    return filterBy(this.dataObjects, 'data', 0);
  }

  get isLoaded() {
    return !!this.dataObjects;
  }

  @action
  setSortBy(prop) {
    if (this.sortBy === prop) {
      prop += ':desc';
    }
    this.sortBy = prop;
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
          sessionObjectives.slice(),
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return parents.length;
          }
        );
        const courseSessionObjectives = await map(
          sessionObjectivesWithParents,
          async (sessionObjective) => {
            const parents = await sessionObjective.courseObjectives;
            return mapBy(parents.slice(), 'id');
          }
        );
        const flatObjectives = courseSessionObjectives.reduce((flattened, arr) => {
          return [...flattened, ...arr];
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
    const mappedObjectives = await map(courseObjectives.slice(), async (courseObjective) => {
      const programYearObjectives = (await courseObjective.programYearObjectives).slice();
      const competency = programYearObjectives.length
        ? await programYearObjectives[0].competency
        : null;
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
        competency,
        courseObjective,
        sessionObjectives,
      };
      const data = minutes.reduce((accumulator, current) => accumulator + parseInt(current, 10), 0);

      return {
        data,
        meta,
      };
    });

    const totalMinutes = mapBy(mappedObjectives, 'data').reduce(
      (total, minutes) => total + minutes,
      0
    );

    return mappedObjectives.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${percent}%`;
      return obj;
    });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
    }
    const { data, meta } = obj;

    let objectiveTitle = meta.courseObjective.title;
    if (meta.competency) {
      objectiveTitle += `(${meta.competency.title})`;
    }

    const title = htmlSafe(`${objectiveTitle} &bull; ${data} ${this.intl.t('general.minutes')}`);
    const sessionTitles = mapBy(meta.sessionObjectives, 'sessionTitle');
    const content = sessionTitles.sort().join(', ');

    this.tooltipTitle = title;
    this.tooltipContent = content;
  });
}
