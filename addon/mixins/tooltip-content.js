import { inject as service } from '@ember/service';
import Mixin from '@ember/object/mixin';
import { computed } from '@ember/object';
import { isBlank } from '@ember/utils';
import moment from 'moment';

export default Mixin.create({
  i18n: service(),
  tooltipContent: computed('event', function() {
    const i18n = this.get('i18n');
    if (this.get('event') == null) {
      return '';
    }

    let addLocationToContents = function(contents, eventLocation) {
      if (! isBlank(eventLocation)) {
        contents = contents + `${eventLocation}<br />`;
      }
      return contents;
    };

    let addInstructorsToContents = function(contents, instructors, taughtByPhrase, etAlPhrase) {
      if (! instructors.length) {
        return contents;
      }

      if (3 > instructors.length) {
        contents = contents + `<br />${taughtByPhrase} ` + instructors.join(', ');
      } else {
        contents = contents + `<br />${taughtByPhrase} ` + instructors.slice(0, 2).join(', ') + ` ${etAlPhrase}`;
      }
      return contents;
    };

    let addCourseTitleToContents = function(contents, courseTitle, courseTitlePhrase) {
      if (courseTitle) {
        contents = contents + `<br />${courseTitlePhrase}: ${courseTitle}`;
      }
      return contents;
    };

    const eventLocation = this.get('event.location') || '';
    const name = this.get('event.name');
    const startTime = moment(this.get('event.startDate')).format(this.get('timeFormat'));
    const endTime = moment(this.get('event.endDate')).format(this.get('timeFormat'));
    const dueThisDay = i18n.t('general.dueThisDay');
    const instructors = this.get('event.instructors') || [];
    const courseTitle = this.get('event.courseTitle');
    const isMulti = this.get('event.isMulti');
    const taughtByPhrase = i18n.t('general.taughtBy');
    const multiplePhrase = i18n.t('general.multiple');
    const courseTitlePhrase = i18n.t('general.course');
    const etAlPhrase = i18n.t('general.etAl');
    let contents = '';

    if (this.get('isIlm')) {
      if (! isMulti) {
        contents = addLocationToContents(contents, eventLocation);
      }
      contents = contents + `ILM - ${dueThisDay}<br />${name}`;
      if (! isMulti) {
        contents = addInstructorsToContents(contents, instructors, taughtByPhrase, etAlPhrase);
      }
      contents = addCourseTitleToContents(contents, courseTitle, courseTitlePhrase);
      if (isMulti) {
        contents = contents + `<br />, ${multiplePhrase}`;
      }
    } else if (this.get('isOffering')) {
      if (! isMulti) {
        contents = addLocationToContents(contents, eventLocation);
      }
      contents = contents + `${startTime} - ${endTime}<br />${name}`;
      if (! isMulti) {
        contents = addInstructorsToContents(contents, instructors, taughtByPhrase, etAlPhrase);
      }
      contents = addCourseTitleToContents(contents, courseTitle, courseTitlePhrase);
      if (isMulti) {
        contents = contents + `<br />, ${multiplePhrase}`;
      }
    } else { // 'TBD' event
      contents = `TBD<br />${startTime} - ${endTime}<br />${name}`;
    }

    return contents;
  }),
});
