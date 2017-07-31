import Component from '@ember/component';
import ObjectiListItem from 'ilios/mixins/objective-list-item';

export default Component.extend(ObjectiListItem, {
  session: null,
  editable: true,
});
