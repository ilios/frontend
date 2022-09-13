import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { mapBy, uniqueValues } from '../utils/array-helpers';

export default class VisualizerCourseVocabulary extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions, []]);

  @use dataObjects = new AsyncProcess(() => [this.getDataObjects.bind(this), this.sessions]);

  get isLoaded() {
    return !!this.dataObjects;
  }

  async getDataObjects(sessions) {
    if (!sessions) {
      return [];
    }
    const sessionsWithMinutes = await map(sessions.slice(), async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const terms = await map(sessionsWithMinutes, async ({ session, minutes }) => {
      const sessionTerms = await session.get('terms');
      const sessionTermsInThisVocabulary = await filter(sessionTerms.slice(), async (term) => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === this.args.vocabulary.get('id');
      });
      return sessionTermsInThisVocabulary.map((term) => {
        return {
          term,
          session: {
            title: session.get('title'),
            minutes,
          },
        };
      });
    });

    return terms.reduce((flattened, obj) => {
      return flattened.push(obj.slice());
    }, []);
  }

  get data() {
    const termData = this.dataObjects.reduce((set, { term, session }) => {
      const termTitle = term.get('title');
      let existing = set.findBy('label', termTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: termTitle,
          meta: {
            termTitle,
            termId: term.get('id'),
            sessions: [],
          },
        };
        set.pushObject(existing);
      }
      existing.data += session.minutes;
      existing.meta.sessions.pushObject(session.title);

      return set;
    }, []);

    const totalMinutes = mapBy(termData, 'data').reduce((total, minutes) => total + minutes, 0);
    const mappedTermsWithLabel = termData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.meta.termTitle}: ${obj.data} ${this.intl.t('general.minutes')}`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedTermsWithLabel.sort((first, second) => {
      return first.data - second.data;
    });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;

    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = uniqueValues(meta.sessions).sort().join(', ');
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo('course-visualize-term', this.args.course.id, obj.meta.termId);
  }
}
