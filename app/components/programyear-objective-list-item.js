import Component from '@ember/component';
import ObjectiveListItem from 'ilios-common/mixins/objective-list-item';

export default Component.extend(ObjectiveListItem, {
  programYear: null,
  expanded: true,
  classNames: ['objective-list-item'],
});
