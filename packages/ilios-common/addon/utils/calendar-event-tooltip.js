import { isBlank } from '@ember/utils';
import { DateTime } from 'luxon';
import { htmlSafe } from '@ember/template';

export default function calendarEventTooltip(event, intl, timeFormat) {
  const addLocationToContents = function (contents, eventLocation) {
    if (!isBlank(eventLocation)) {
      contents = contents + `${eventLocation}<br />`;
    }
    return contents;
  };

  const addHasPreworkToContents = function (contents) {
    return contents + '<br />' + intl.t('general.hasPrework');
  };

  const addInstructorsToContents = function (contents, instructors, etAlPhrase) {
    if (!instructors.length) {
      return contents;
    }

    if (3 > instructors.length) {
      contents =
        contents + '<br /> ' + intl.t('general.taughtBy', { instructors: instructors.join(', ') });
    } else {
      contents =
        contents +
        '<br /> ' +
        intl.t('general.taughtBy', {
          instructors: instructors.slice(0, 2).join(', '),
        }) +
        ` ${etAlPhrase}`;
    }
    return contents;
  };

  const addCourseTitleToContents = function (contents, courseTitle, courseTitlePhrase) {
    if (courseTitle) {
      contents = contents + `<br />${courseTitlePhrase}: ${courseTitle}`;
    }
    return contents;
  };

  const addSessionTypeTitleToContents = function (
    contents,
    sessionTypeTitle,
    sessionTypeTitlePhrase,
  ) {
    if (sessionTypeTitle) {
      contents = contents + `<br />${sessionTypeTitlePhrase}: ${sessionTypeTitle}`;
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
    contents = contents + `ILM - ${intl.t('general.dueBy')} ${startTime}<br />${name}`;
    if (!isMulti) {
      contents = addInstructorsToContents(contents, instructors, intl.t('general.etAl'));
    }

    contents = addCourseTitleToContents(contents, courseTitle, intl.t('general.course'));
    contents = addSessionTypeTitleToContents(
      contents,
      sessionTypeTitle,
      intl.t('general.sessionType'),
    );
    if (isMulti) {
      contents = contents + `,<br /> ${intl.t('general.multiple')}`;
    }
  } else if (event.offering) {
    if (!isMulti) {
      contents = addLocationToContents(contents, eventLocation);
    }
    contents = contents + `${startTime} - ${endTime}<br />${name}`;
    if (!isMulti) {
      contents = addInstructorsToContents(contents, instructors, intl.t('general.etAl'));
    }
    contents = addCourseTitleToContents(contents, courseTitle, intl.t('general.course'));
    contents = addSessionTypeTitleToContents(
      contents,
      sessionTypeTitle,
      intl.t('general.sessionType'),
    );
    if (isMulti) {
      contents = contents + `,<br />${intl.t('general.multiple')}`;
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
