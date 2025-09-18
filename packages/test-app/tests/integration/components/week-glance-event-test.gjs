import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { DateTime } from 'luxon';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/week-glance-event';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import WeekGlanceEvent from 'ilios-common/components/week-glance-event';

const today = DateTime.fromObject({ hour: 8 });

module('Integration | Component | week-glance-event', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders with some stuff', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      url: 'https://zoom.example.com/123?p=456',
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
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          sessionLearningMaterial: 1,
        },
        {
          title: 'Link LM',
          required: false,
          link: 'http://myhost.com/url2',
          sessionLearningMaterial: 2,
        },
        {
          title: 'File LM',
          filename: 'This is a PDF',
          mimetype: 'application/pdf',
          required: true,
          absoluteFileUri: 'http://myhost.com/url1',
          sessionLearningMaterial: 3,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.sessionType, 'Lecture');
    assert.strictEqual(component.location, '- Room 123');
    assert.strictEqual(component.link, 'Virtual Session Link');
    assert.strictEqual(component.url, 'https://zoom.example.com/123?p=456');
    assert.ok(component.hasDescription);
    assert.strictEqual(
      component.description.content.text,
      'Best Session For SureLorem ipsum dolor sit amet, c',
    );
    assert.strictEqual(component.learningMaterials.materials.length, 3);
    assert.strictEqual(component.learningMaterials.materials[0].title, 'Citation LM');
    assert.ok(component.learningMaterials.materials[0].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[0].typeIcon.isCitation);
    assert.ok(component.learningMaterials.materials[0].hasCitation);
    assert.strictEqual(component.learningMaterials.materials[0].citation, 'citationtext');
    assert.ok(component.learningMaterials.materials[0].hasPublicNotes);
    assert.strictEqual(component.learningMaterials.materials[0].publicNotes, '- This is cool.');

    assert.strictEqual(component.learningMaterials.materials[1].title, 'Link LM');
    assert.ok(component.learningMaterials.materials[1].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[1].typeIcon.isLink);
    assert.notOk(component.learningMaterials.materials[1].hasCitation);
    assert.notOk(component.learningMaterials.materials[1].hasPublicNotes);
    assert.strictEqual(component.learningMaterials.materials[1].url, 'http://myhost.com/url2');

    assert.strictEqual(component.learningMaterials.materials[2].title, 'File LM');
    assert.ok(component.learningMaterials.materials[2].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[2].typeIcon.isPdf);
    assert.notOk(component.learningMaterials.materials[2].hasCitation);
    assert.notOk(component.learningMaterials.materials[2].hasPublicNotes);
    assert.strictEqual(
      component.learningMaterials.materials[2].url,
      'http://myhost.com/url1?inline',
    );

    assert.notOk(component.hasInstructors);
    assert.strictEqual(component.sessionAttributes.length, 4);
    assert.ok(component.sessionAttributes[0].attire);
    assert.ok(component.sessionAttributes[1].equipment);
    assert.ok(component.sessionAttributes[2].attendance);
    assert.ok(component.sessionAttributes[3].supplemental);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders with other stuff', async function (assert) {
    this.set('event', {
      name: 'Finding the Point in Life',
      startDate: today.toISO(),
      location: 'Room 456',
      sessionTypeTitle: 'Independent Learning',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [
        {
          title: 'Great Slides',
          required: true,
          filename: 'This is another PDF',
          mimetype: 'application/pdf',
          absoluteFileUri: 'http://myhost.com/url1',
          publicNotes: 'slide notes',
          sessionLearningMaterial: 1,
        },
      ],
      instructors: ['Second Person', 'First Person'],
      attireRequired: false,
      equipmentRequired: false,
      attendanceRequired: false,
      supplemental: false,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    assert.strictEqual(component.title, 'Finding the Point in Life');
    assert.strictEqual(component.sessionType, 'Independent Learning');
    assert.strictEqual(component.location, '- Room 456');
    assert.notOk(component.hasDescription);
    assert.strictEqual(component.learningMaterials.materials.length, 1);
    assert.strictEqual(component.learningMaterials.materials[0].title, 'Great Slides');
    assert.ok(component.learningMaterials.materials[0].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[0].typeIcon.isPdf);
    assert.notOk(component.learningMaterials.materials[0].hasCitation);
    assert.ok(component.learningMaterials.materials[0].hasPublicNotes);
    assert.strictEqual(component.learningMaterials.materials[0].publicNotes, '- slide notes');
    assert.strictEqual(
      component.learningMaterials.materials[0].url,
      'http://myhost.com/url1?inline',
    );

    assert.ok(component.hasInstructors);
    assert.strictEqual(component.instructors, 'Instructors: First Person, Second Person');
    assert.strictEqual(component.sessionAttributes.length, 0);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders durations properly', async function (assert) {
    const event = {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      url: 'https://zoom.example.com/123?p=456',
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
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          sessionLearningMaterial: 1,
        },
        {
          title: 'Link LM',
          required: false,
          link: 'http://myhost.com/url2',
          sessionLearningMaterial: 2,
        },
        {
          title: 'File LM',
          filename: 'This is a PDF',
          mimetype: 'application/pdf',
          required: true,
          absoluteFileUri: 'http://myhost.com/url1',
          sessionLearningMaterial: 3,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    };

    event.endDate = today.plus({ minutes: 1 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 minute)');

    event.endDate = today.plus({ minutes: 15 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 15 minutes)');

    event.endDate = today.plus({ minutes: 90 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 hour, 30 minutes)');

    event.endDate = today.plus({ hours: 1 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 hour)');

    event.endDate = today.plus({ hours: 2, minutes: 25 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 2 hours, 25 minutes)');

    event.endDate = today.plus({ hours: 36 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 day, 12 hours)');

    event.endDate = today.plus({ days: 1, hours: 0, minutes: 0 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 day)');

    event.endDate = today.plus({ days: 1, hours: 0, minutes: 55 });
    await render(<template><WeekGlanceEvent @event={{event}} /></template>);
    assert.strictEqual(component.date, '08:00 AM (Duration: 1 day, 55 minutes)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders schedule materials', async function (assert) {
    this.set('event', {
      name: 'Schedule some materials',
      startDate: today.toISO(),
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
          title: 'In the window',
          required: true,
          isBlanked: false,
          citation: 'citationtext',
          endDate: today.plus({ days: 1 }).toJSDate(),
          startDate: today.minus({ days: 1 }).toJSDate(),
          sessionLearningMaterial: 1,
        },
        {
          title: 'Too Early',
          required: true,
          isBlanked: true,
          citation: 'citationtext',
          startDate: DateTime.fromObject({ year: 2001, month: 12, day: 31 }).toJSDate(),
          sessionLearningMaterial: 2,
        },
        {
          title: 'Too Late',
          required: true,
          isBlanked: true,
          citation: 'citationtext',
          endDate: DateTime.fromObject({ year: 2035, month: 6, day: 1 }).toJSDate(),
          sessionLearningMaterial: 3,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    assert.strictEqual(component.title, 'Schedule some materials');
    assert.strictEqual(component.sessionType, 'Lecture');
    assert.strictEqual(component.location, '- Room 123');
    assert.ok(component.hasDescription);
    assert.strictEqual(
      component.description.content.text,
      'Best Session For Sure' + 'Lorem ipsum dolor sit amet, c',
    );
    assert.strictEqual(component.learningMaterials.materials.length, 3);
    assert.strictEqual(component.learningMaterials.materials[0].title, 'In the window');
    assert.ok(component.learningMaterials.materials[0].timedReleaseInfo.length > 0);
    assert.strictEqual(component.learningMaterials.materials[1].title, 'Too Early');
    assert.strictEqual(component.learningMaterials.materials[1].timedReleaseInfo.length, 0);
    assert.strictEqual(component.learningMaterials.materials[2].title, 'Too Late');
    assert.ok(component.learningMaterials.materials[2].timedReleaseInfo.length > 0);

    assert.notOk(component.hasInstructors);
    assert.strictEqual(component.sessionAttributes.length, 4);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it renders prework', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription:
        'Best <strong>Session</strong> For Sure' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      prerequisites: [
        { name: 'prework 1', slug: 'e1' },
        { name: 'prework 2', slug: 'e2' },
      ],
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.learningMaterials.prework.length, 2);
    assert.strictEqual(component.learningMaterials.prework[0].name, 'prework 1');
    assert.ok(component.learningMaterials.prework[0].hasLink);
    assert.strictEqual(component.learningMaterials.prework[1].name, 'prework 2');
    assert.ok(component.learningMaterials.prework[1].hasLink);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('it skips course learning materials', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
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
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          courseLearningMaterial: 1,
        },
        {
          title: 'Link LM',
          required: false,
          link: 'http://myhost.com/url2',
          sessionLearningMaterial: 1,
        },
        {
          title: 'File LM',
          filename: 'This is a PDF',
          mimetype: 'application/pdf',
          required: true,
          absoluteFileUri: 'http://myhost.com/url1',
          sessionLearningMaterial: 2,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    assert.strictEqual(component.title, 'Learn to Learn');
    assert.strictEqual(component.learningMaterials.materials.length, 2);

    assert.strictEqual(component.learningMaterials.materials[0].title, 'Link LM');
    assert.ok(component.learningMaterials.materials[0].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[0].typeIcon.isLink);
    assert.notOk(component.learningMaterials.materials[0].hasCitation);
    assert.notOk(component.learningMaterials.materials[0].hasPublicNotes);
    assert.strictEqual(component.learningMaterials.materials[0].url, 'http://myhost.com/url2');

    assert.strictEqual(component.learningMaterials.materials[1].title, 'File LM');
    assert.ok(component.learningMaterials.materials[1].typeIcon.isPresent);
    assert.ok(component.learningMaterials.materials[1].typeIcon.isPdf);
    assert.notOk(component.learningMaterials.materials[1].hasCitation);
    assert.notOk(component.learningMaterials.materials[1].hasPublicNotes);
    assert.strictEqual(
      component.learningMaterials.materials[1].url,
      'http://myhost.com/url1?inline',
    );
  });

  test('it does not render materials if there are only course materials', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
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
          required: true,
          publicNotes: 'This is cool.',
          citation: 'citationtext',
          courseLearningMaterial: 1,
        },
      ],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.title, 'Learn to Learn');
    assert.notOk(component.hasLearningMaterials);
  });

  test('it does not render materials if there are none', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription:
        'Best <strong>Session</strong> For Sure' +
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);

    await a11yAudit(this.element);
    assert.strictEqual(component.title, 'Learn to Learn');
    assert.notOk(component.hasLearningMaterials);
  });

  test('it renders markup on short session description', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: '<h1 data-test-heading>Test</h1>',
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);
    assert.strictEqual(component.description.content.text, 'Test');
    assert.dom('[data-test-heading]').exists();
  });

  test('it renders markup when long session description is expanded', async function (assert) {
    this.set('event', {
      name: 'Learn to Learn',
      startDate: today.toISO(),
      location: 'Room 123',
      sessionTypeTitle: 'Lecture',
      courseExternalId: 'C1',
      sessionDescription: '<h1 data-test-heading>Test</h1> ' + 't'.repeat(400),
      isBlanked: false,
      isPublished: true,
      isScheduled: false,
      learningMaterials: [],
      attireRequired: true,
      equipmentRequired: true,
      attendanceRequired: true,
      supplemental: true,
    });
    await render(<template><WeekGlanceEvent @event={{this.event}} /></template>);
    assert.strictEqual(component.description.content.text, 'Test ' + 't'.repeat(45));
    assert.dom('[data-test-heading]').doesNotExist();
    await component.description.content.expand.click();
    assert.strictEqual(component.description.content.text, 'Test ' + 't'.repeat(400));
    assert.dom('[data-test-heading]').exists();
  });
});
