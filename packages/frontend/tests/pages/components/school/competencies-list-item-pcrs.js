import { clickable, collection, create, isPresent } from 'ember-cli-page-object';
import bigSaveCancelButtons from 'ilios-common/components/big-save-cancel-buttons';

const definition = {
  scope: '[data-test-school-competencies-list-item-pcrs]',
  bigSaveCancelButtons,
  items: collection('li', {
    edit: clickable('button'),
    isEditable: isPresent('button'),
  }),
};

export default definition;
export const component = create(definition);
