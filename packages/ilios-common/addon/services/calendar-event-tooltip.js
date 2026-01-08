import Service, { service } from '@ember/service';
import { isBlank } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { DateTime } from 'luxon';

export default class CalendarEventTooltip extends Service {
  @service intl;

  create(event, timeFormat) {
    const addLocationToContents = function (contents, eventLocation) {
      if (!isBlank(eventLocation)) {
        contents = contents + `${eventLocation}<br />`;
      }
      return contents;
    };

    const addHasPreworkToContents = (contents) => {
      return contents + '<br />' + this.intl.t('general.hasPrework');
    };

    const addInstructorsToContents = (contents, instructors) => {
      if (!instructors.length) {
        return contents;
      }

      if (3 > instructors.length) {
        contents =
          contents +
          '<br /> ' +
          this.intl.t('general.taughtBy', { instructors: instructors.join(', ') });
      } else {
        contents =
          contents +
          '<br /> ' +
          this.intl.t('general.taughtBy', {
            instructors: instructors.slice(0, 2).join(', '),
          }) +
          ' ' +
          this.intl.t('general.etAl');
      }
      return contents;
    };

    const addCourseTitleToContents = (contents, courseTitle) => {
      if (courseTitle) {
        contents = contents + '<br />' + this.intl.t('general.course') + `: ${courseTitle}`;
      }
      return contents;
    };

    const addSessionTypeTitleToContents = (contents, sessionTypeTitle) => {
      if (sessionTypeTitle) {
        contents =
          contents + '<br />' + this.intl.t('general.sessionType') + `: ${sessionTypeTitle}`;
      }
      return contents;
    };

    const eventLocation = event.location || '';
    const name = event.name;
    const startTime = DateTime.fromISO(event.startDate).toFormat(timeFormat);
    const endTime = DateTime.fromISO(event.endDate).toFormat(timeFormat);
    const instructors = event.instructors || [];
    const courseTitle = event.courseTitle;
    const sessionTypeTitle = event.sessionTypeTitle;
    const isMulti = event.isMulti;

    let contents = '';

    if (event.ilmSession) {
      if (!isMulti) {
        contents = addLocationToContents(contents, eventLocation);
      }
      contents = contents + `ILM - ${this.intl.t('general.dueBy')} ${startTime}<br />${name}`;
      if (!isMulti) {
        contents = addInstructorsToContents(contents, instructors);
      }

      contents = addCourseTitleToContents(contents, courseTitle, this.intl.t('general.course'));
      contents = addSessionTypeTitleToContents(contents, sessionTypeTitle);
      if (isMulti) {
        contents = contents + `,<br /> ${this.intl.t('general.multiple')}`;
      }
    } else if (event.offering) {
      if (!isMulti) {
        contents = addLocationToContents(contents, eventLocation);
      }
      contents = contents + `${startTime} - ${endTime}<br />${name}`;
      if (!isMulti) {
        contents = addInstructorsToContents(contents, instructors);
      }
      contents = addCourseTitleToContents(contents, courseTitle);
      contents = addSessionTypeTitleToContents(contents, sessionTypeTitle);
      if (isMulti) {
        contents = contents + `,<br />${this.intl.t('general.multiple')}`;
      }

      if (event.hasPrework) {
        contents = addHasPreworkToContents(contents);
      }
    } else {
      // 'TBD' event
      contents = `TBD<br />${startTime} - ${endTime}<br />${name}`;
    }

    return htmlSafe(contents);
  }
}
