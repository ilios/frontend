import {
  attribute,
  create,
  collection,
  text,
} from 'ember-cli-page-object';
import table1 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table1';
import table2 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table2';
import table3a from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table3a';
import table3b from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table3b';
import table4 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table4';
import table5 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table5';
import table6 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table6';
import table7 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table7';
import table8 from 'ilios/tests/pages/components/curriculum-inventory-verification-preview-table8';

const definition = {
  scope: '[data-test-curriculum-inventory-verification-preview]',
  tableOfContents: {
    scope: '[data-test-table-of-contents]',
    items: collection('li', {
      text: text(),
      link: attribute('href', 'a'),
    }),
  },
  table1,
  table2,
  table3a,
  table3b,
  table4,
  table5,
  table6,
  table7,
  table8,
};

export default definition;
export const component = create(definition);
