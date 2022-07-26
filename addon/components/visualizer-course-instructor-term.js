import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class VisualizerCourseInstructorTerm extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use loadedData = new AsyncProcess(() => [this.getData.bind(this), this.sessions]);

  get data() {
    if (!this.loadedData) {
      return [];
    }
    return this.loadedData;
  }

  async getData(sessions) {
    if (!sessions) {
      return [];
    }

    const sessionsWithUser = await filter(sessions.toArray(), async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return allInstructors.mapBy('id').includes(this.args.user.id);
    });

    const sessionsWithTerms = await map(sessionsWithUser, async (session) => {
      const terms = await map((await session.terms).toArray(), async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          termTitle: term.title,
          vocabularyTitle: vocabulary.title,
        };
      });

      return {
        session,
        terms,
      };
    });

    const totalMinutes = (
      await map(sessionsWithTerms, async ({ session }) => {
        return await session.getTotalSumOfferingsDurationByInstructor(this.args.user);
      })
    ).reduce((total, mins) => total + mins, 0);

    const dataMap = await map(sessionsWithTerms, async ({ session, terms }) => {
      const minutes = await session.getTotalSumDurationByInstructor(this.args.user);
      return terms.map(({ termTitle, vocabularyTitle }) => {
        return {
          sessionTitle: session.title,
          termTitle,
          vocabularyTitle,
          minutes,
        };
      });
    });

    const flat = dataMap.reduce((flattened, obj) => {
      return flattened.pushObjects(obj);
    }, []);

    const sessionTermData = flat.reduce((set, obj) => {
      const name = `${obj.vocabularyTitle} > ${obj.termTitle}`;
      let existing = set.findBy('label', name);
      if (!existing) {
        existing = {
          data: 0,
          label: name,
          meta: {
            sessions: [],
            vocabularyTitle: obj.vocabularyTitle,
          },
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    return sessionTermData
      .map((obj) => {
        const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
        obj.meta.totalMinutes = totalMinutes;
        obj.meta.percent = percent;
        obj.label = `${obj.label}: ${obj.data} ${this.intl.t('general.minutes')}`;
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabularyTitle.localeCompare(second.meta.vocabularyTitle) ||
          second.data - first.data
        );
      });
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;

    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = meta.sessions.uniq().sort().join();
  }
}
