import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

import { component } from 'ilios-common/page-objects/components/week-glance-pre-work';

const today = moment();

module('Integration | Component | week-glance-pre-work', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    assert.expect(4);
    this.set('events', [
      {
        name: 'Learn to Learn',
        startDate: today.format(),
        location: 'Room 123',
        sessionTypeTitle: 'Lecture',
        courseExternalId: 'C1',
        sessionDescription:
          'Best <strong>Session</strong> For Sure' +
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
        isBlanked: false,
        isPublished: true,
        isScheduled: false,
        learningMaterials: [
          {
            title: 'Citation LM',
            type: 'citation',
            required: true,
            publicNotes: 'This is cool.',
            citation: 'citationtext',
          },
          {
            title: 'Link LM',
            type: 'link',
            required: false,
            link: 'http://myhost.com/url2',
          },
          {
            title: 'File LM',
            type: 'file',
            filename: 'This is a PDF',
            mimetype: 'application/pdf',
            required: true,
            absoluteFileUri: 'http://myhost.com/url1',
          },
        ],
        attireRequired: true,
        equipmentRequired: true,
        attendanceRequired: true,
        supplemental: true,
        postrequisiteName: 'reading to read',
        postrequisiteSlug: '123',
      },
    ]);
    await render(hbs`<WeekGlancePreWork @events={{this.events}} />`);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.date, `Due Before reading to read (${today.format('M/D/Y')})`);
    assert.strictEqual(component.url, '#event123');
    assert.notOk(component.hasMoreInfo);
  });

  test('two items', async function (assert) {
    assert.expect(4);
    this.set('events', [
      {
        name: 'Learn to Learn',
        startDate: today.format(),
        postrequisiteName: 'reading to read',
        postrequisiteSlug: '123',
      },
      {},
    ]);
    await render(hbs`<WeekGlancePreWork @events={{this.events}} />`);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.date, `Due Before reading to read (${today.format('M/D/Y')})`);
    assert.strictEqual(component.url, '#event123');
    assert.strictEqual(component.moreInfo, 'with one more offering');
  });

  test('more than two items', async function (assert) {
    assert.expect(4);
    this.set('events', [
      {
        name: 'Learn to Learn',
        startDate: today.format(),
        postrequisiteName: 'reading to read',
        postrequisiteSlug: '123',
      },
      {},
      {},
    ]);
    await render(hbs`<WeekGlancePreWork @events={{this.events}} />`);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.date, `Due Before reading to read (${today.format('M/D/Y')})`);
    assert.strictEqual(component.url, '#event123');
    assert.strictEqual(component.moreInfo, 'with 2 more offerings');
  });
});
