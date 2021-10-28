import Component from '@glimmer/component';
import { all, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class VisualizerCourseVocabularies extends Component {
  @service router;
  @service intl;
  @tracked data;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @restartableTask
  *load(element, [course]) {
    const sessions = yield course.get('sessions');
    const dataMap = yield map(sessions.toArray(), async (session) => {
      const terms = await session.get('terms');
      const vocabularies = await all(terms.mapBy('vocabulary'));
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);

      return {
        sessionTitle: session.get('title'),
        vocabularies,
        minutes,
      };
    });

    this.data = dataMap.reduce((set, obj) => {
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
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
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
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }
    this.router.transitionTo(
      'course-visualize-vocabulary',
      this.args.course.get('id'),
      obj.meta.vocabulary.get('id')
    );
  }
}
