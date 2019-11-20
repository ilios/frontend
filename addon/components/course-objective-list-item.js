import Component from '@ember/component';
import ObjectiveListItem from 'ilios-common/mixins/objective-list-item';

export default Component.extend(ObjectiveListItem, {
  course: null,
  classNames: ['course-objective-list-item', 'objective-list-item'],
});
