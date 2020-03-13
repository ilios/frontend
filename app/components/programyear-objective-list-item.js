import Component from '@ember/component';
import ObjectiveListItem from 'ilios-common/mixins/objective-list-item';

export default Component.extend(ObjectiveListItem, {
  classNames: ['objective-list-item'],
  programYear: null,
  expanded: true,
});
