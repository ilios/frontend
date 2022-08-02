import Component from '@glimmer/component';
import { all, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class VisualizerCourseVocabularies extends Component {
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
    const sessionsWithMinutes = await map(sessions.toArray(), async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    return map(sessionsWithMinutes, async ({ session, minutes }) => {
      const terms = await session.terms;
      const vocabularies = await all(terms.mapBy('vocabulary'));
      return {
        sessionTitle: session.title,
        vocabularies,
        minutes,
      };
    });
  }

  get data() {
    return this.dataObjects.reduce((set, obj) => {
      obj.vocabularies.forEach((vocabulary) => {
        const vocabularyTitle = vocabulary.get('title');
        let existing = set.findBy('label', vocabularyTitle);
        if (!existing) {
          existing = {
            data: 0,
            label: vocabularyTitle,
            meta: {
              vocabulary,
              sessions: [],
            },
          };
          set.pushObject(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.pushObject(obj.sessionTitle);
      });

      return set;
    }, []);
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { meta } = obj;

    this.tooltipTitle = htmlSafe(meta.vocabulary.get('title'));
    this.tooltipContent = this.intl.t('general.clickForMore');
  }

  @action
  donutClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo(
      'course-visualize-vocabulary',
      this.args.course.id,
      obj.meta.vocabulary.id
    );
  }
}
