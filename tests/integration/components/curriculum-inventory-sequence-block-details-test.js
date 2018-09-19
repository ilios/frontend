import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled, findAll } from '@ember/test-helpers';
import { module, test } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import tHelper from "ember-i18n/helper";

const { resolve } = RSVP;

module('Integration | Component | curriculum inventory sequence block details', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.lookup('service:i18n').set('locale', 'en');
    this.owner.register('helper:t', tHelper);
  });

  test('it renders', async function(assert) {
    assert.expect(7);

    let school = EmberObject.create({ id() { return 1; }});

    let academicLevels = [];
    for (let i = 0; i < 10; i++) {
      academicLevels.pushObject(EmberObject.create({ id: i, name: `Year ${i + 1}` }));
    }

    let program = EmberObject.create({
      belongsTo() {
        return school;
      }
    });

    let report = EmberObject.create({
      academicLevels,
      year: '2016',
      program: resolve(program),
      linkedCourses: resolve([]),
      isFinalized: resolve(false)
    });

    let grandParentBlock = EmberObject.create({
      id: 1,
      title: 'Okely Dokely',
    });

    let parentBlock = EmberObject.create({
      id: 2,
      title: 'Foo',
      parent: resolve(grandParentBlock)
    });

    grandParentBlock.set('children', resolve([ parentBlock ]));

    let academicLevel = academicLevels[0];

    let block = EmberObject.create({
      id: 3,
      description: 'lorem ipsum',
      report: resolve(report),
      parent: resolve(parentBlock),
      sessions: resolve([]),
      duration: 12,
      startDate: moment('2015-01-02'),
      endDate: moment('2015-04-30'),
      childSequenceOrder: 1,
      orderInSequence: 1,
      course: resolve(null),
      required: 2,
      track: true,
      minimum: 2,
      maximum: 15,
      academicLevel: resolve(academicLevel),
      title: 'bar',
      allParents: resolve([ parentBlock, grandParentBlock ])
    });

    parentBlock.set('children', resolve([ block ]));

    this.set('report', report);
    this.set('sequenceBlock', block);
    this.set('sortBy', 'title');
    this.set('setSortSessionsBy', null);

    await render(
      hbs`{{curriculum-inventory-sequence-block-details sequenceBlock=sequenceBlock canUpdate=true sortSessionsBy=sortBy setSortSessionBy=(action (mut sortSessionsBy))}}
    `
    );
    return settled().then(() => {
      assert.dom('.curriculum-inventory-sequence-block-header .title').hasText(block.get('title'), 'Block header is visible.');
      assert.dom('.curriculum-inventory-sequence-block-overview .description .editinplace').hasText(block.get('description'), 'Block overview is visible.');
      assert.dom('.breadcrumbs span').exists({ count: 4 }, 'Breadcrumb has the right number of elements');
      assert.dom('.breadcrumbs span').hasText('Curriculum Inventory Report');
      assert.dom(findAll('.breadcrumbs span')[1]).hasText(grandParentBlock.get('title'));
      assert.dom(findAll('.breadcrumbs span')[2]).hasText(parentBlock.get('title'));
      assert.dom(findAll('.breadcrumbs span')[3]).hasText(block.get('title'));
    });
  });
});

