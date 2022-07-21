import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class VisualizerCourseInstructorTerm extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked data = [];

  @restartableTask
  *load() {
    const sessions = yield this.args.course.sessions;

    const sessionsWithUser = yield filter(sessions.toArray(), async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return allInstructors.mapBy('id').includes(this.args.user.id);
    });

    const sessionsWithTerms = yield map(sessionsWithUser, async (session) => {
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

    const totalMinutes = (yield map(sessionsWithTerms, async ({ session }) => {
      return await session.getTotalSumOfferingsDurationByInstructor(this.args.user);
    })).reduce((total, mins) => total + mins, 0);

    const dataMap = yield map(sessionsWithTerms, async ({ session, terms }) => {
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

    this.data = sessionTermData
      .map((obj) => {
        const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
        obj.label = `${obj.label} ${percent}%`;
        obj.meta.totalMinutes = totalMinutes;
        obj.meta.percent = percent;
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
    const { label, data, meta } = obj;

    this.tooltipTitle = htmlSafe(`${label} ${data} ${this.intl.t('general.minutes')}`);
    this.tooltipContent = meta.sessions.uniq().sort().join();
  }
}
