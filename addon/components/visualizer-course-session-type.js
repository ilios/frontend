import Component from '@glimmer/component';
import { map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class VisualizerCourseSessionType extends Component {
  @service router;
  @service intl;
  @tracked data;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @restartableTask
  *load(element, [course, sessionType]) {
    const courseSessions = yield course.get('sessions');
    const sessionTypeSessionIds = sessionType.hasMany('sessions').ids();

    const sessions = courseSessions.filter((session) =>
      sessionTypeSessionIds.includes(session.get('id'))
    );
    const termData = yield map(sessions, async (session) => {
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const terms = await session.get('terms');
      return map(terms.toArray(), async (term) => {
        const vocabulary = await term.get('vocabulary');
        return {
          sessionTitle: session.get('title'),
          termTitle: term.get('title'),
          vocabularyTitle: vocabulary.get('title'),
          minutes,
        };
      });
    });

    const flat = termData.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    const data = flat.reduce((set, obj) => {
      const label = obj.vocabularyTitle + ' - ' + obj.termTitle;
      let existing = set.findBy('label', label);
      if (!existing) {
        existing = {
          data: 0,
          label,
          meta: {
            vocabularyTitle: obj.vocabularyTitle,
            sessions: [],
          },
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = data.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    this.data = data
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
          first.data - second.data
        );
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
    this.tooltipContent = meta.sessions.uniq().sort().join(', ');
  }
}
