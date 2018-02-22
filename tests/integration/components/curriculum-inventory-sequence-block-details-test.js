import { getOwner } from '@ember/application';
import RSVP from 'rsvp';
import EmberObject from '@ember/object';
import { setupRenderingTest } from 'ember-qunit';
import { render, settled } from '@ember/test-helpers';
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
      hbs`{{curriculum-inventory-sequence-block-details sequenceBlock=sequenceBlock sortSessionsBy=sortBy setSortSessionBy=(action (mut sortSessionsBy))}}
    `
    );
    return settled().then(() => {
      assert.equal(this.$('.curriculum-inventory-sequence-block-header .title').text().trim(),
        block.get('title'), 'Block header is visible.');
      assert.equal(this.$('.curriculum-inventory-sequence-block-overview .description .editinplace').text().trim(),
        block.get('description'), 'Block overview is visible.');
      assert.equal(this.$('.breadcrumbs span').length, 4, 'Breadcrumb has the right number of elements');
      assert.equal(this.$('.breadcrumbs span:eq(0)').text().trim(), 'Curriculum Inventory Report');
      assert.equal(this.$('.breadcrumbs span:eq(1)').text().trim(), grandParentBlock.get('title'));
      assert.equal(this.$('.breadcrumbs span:eq(2)').text().trim(), parentBlock.get('title'));
      assert.equal(this.$('.breadcrumbs span:eq(3)').text().trim(), block.get('title'));
    });
  });
});