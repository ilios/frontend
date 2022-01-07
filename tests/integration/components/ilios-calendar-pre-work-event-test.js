import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';
import { component } from 'ilios-common/page-objects/components/ilios-calendar-pre-work-event';
const today = moment();

module('Integration | Component | ilios-calendar-pre-work-event', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');

  hooks.beforeEach(function () {
    this.owner.setupRouter();
    this.set('event', {
      name: 'Learn to Learn',
      slug: 'abc',
      startDate: today.format(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription:
        'Best <strong>Session</strong>For Sure' +
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
    });
  });

  test('it renders with links enabled', async function (assert) {
    this.set('selectable', true);
    await render(hbs`<IliosCalendarPreWorkEvent
      @event={{this.event}}
      @areEventsSelectable={{this.selectable}}
    />`);
    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.titleUrl, '/events/abc');
    assert.strictEqual(component.date, `Due Before reading to read (${today.format('M/D/Y')})`);
    assert.strictEqual(component.url, '/events/123');
  });

  test('it renders without links enabled', async function (assert) {
    this.set('selectable', false);
    await render(hbs`<IliosCalendarPreWorkEvent
      @event={{this.event}}
      @areEventsSelectable={{this.selectable}}
    />`);
    assert.strictEqual(component.title, 'Learn to Learn');
    assert.notOk(component.titleUrlIsPresent);
    assert.strictEqual(component.date, `Due Before reading to read (${today.format('M/D/Y')})`);
    assert.notOk(component.urlIsPresent);
  });
});
