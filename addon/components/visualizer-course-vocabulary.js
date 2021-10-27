import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class VisualizerCourseVocabulary extends Component {
  @service router;
  @service intl;
  @tracked data;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @restartableTask
  *load(element, [course, vocabulary]) {
    const sessions = yield course.get('sessions');
    const terms = yield map(sessions.toArray(), async (session) => {
      const sessionTerms = await session.get('terms');
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const sessionTermsInThisVocabulary = await filter(sessionTerms.toArray(), async (term) => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === vocabulary.get('id');
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

    const flat = terms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    const termData = flat.reduce((set, { term, session }) => {
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

    const totalMinutes = termData.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedTermsWithLabel = termData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.meta.termTitle} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    this.data = mappedTermsWithLabel.sort((first, second) => {
      return first.data - second.data;
    });
  }

  @restartableTask
  *barHover(obj) {
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

  @action
  barClick(obj) {
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }
    this.router.transitionTo('course-visualize-term', this.args.course.get('id'), obj.meta.termId);
  }
}
