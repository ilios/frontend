import {
  module,
  test
} from 'qunit';
import startApp from 'ilios/tests/helpers/start-app';
import destroyApp from 'ilios/tests/helpers/destroy-app';
import setupAuthentication from 'ilios/tests/helpers/setup-authentication';

var application;
var url = '/curriculum-inventory-reports/1';
module('Acceptance: Curriculum Inventory: Report', {
  beforeEach: function() {
    application = startApp();
    setupAuthentication(application);
  },

  afterEach: function() {
    destroyApp(application);
  }
});

test('create new sequence block Issue #2108', function(assert) {
  server.create('program');
  server.create('curriculumInventoryReport');
  server.create('curriculumInventorySequence');

  const sequenceBlockList = '.curriculum-inventory-sequence-block-list';
  const addSequenceBlock = `${sequenceBlockList} .expand-button`;
  const newBlockForm = '.new-curriculum-inventory-sequence-block';
  const newFormTitle = `${newBlockForm} .new-result-title`;

  visit(url);
  andThen(function() {
    assert.equal(currentPath(), 'curriculumInventoryReport.index');
    assert.equal(find(newBlockForm).length, 0);
    assert.equal(find(newFormTitle).length, 0);
    click(addSequenceBlock).then(()=>{
      assert.equal(find(newBlockForm).length, 1);
      assert.equal(find(newFormTitle).length, 1);
      assert.equal(getElementText(newFormTitle), getText('New Sequence Block'));
    });
  });
});
