import Component from '@ember/component';
import ObjectiListItem from 'ilios-common/mixins/objective-list-item';

export default Component.extend(ObjectiListItem, {
  session: null,
  classNames: ['session-objective-list-item', 'objective-list-item'],
});
