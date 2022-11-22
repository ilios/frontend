import { module, test } from 'qunit';
import { setupRenderingTest } from 'dummy/tests/helpers';
import { setupIntl } from 'ember-intl/test-support';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import { component } from 'ilios-common/page-objects/components/single-event-learningmaterial-list';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | single-event-learningmaterial-list', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'en-us');
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.set('learningMaterials', [
      {
        title: 'first one',
        mimetype: 'application/pdf',
        absoluteFileUri: 'http://firstlink',
      },
      {
        title: 'second one',
        mimetype: 'audio/wav',
      },
      {
        title: 'third one',
        isBlanked: true,
      },
    ]);
    await render(
      hbs`<SingleEventLearningmaterialList @learningMaterials={{this.learningMaterials}} />
`
    );

    assert.strictEqual(component.items.length, 3);
    assert.strictEqual(component.items[0].title, 'first one');
    assert.ok(component.items[0].typeIcon.isPdf);
    assert.strictEqual(component.items[1].title, 'second one');
    assert.ok(component.items[1].typeIcon.isAudio);
    assert.strictEqual(component.items[2].title, 'third one');
    assert.notOk(component.items[2].typeIcon.isPresent);
    assert.notOk(component.noContent.isVisible);
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('displays `None` when provided no content', async function (assert) {
    this.set('learningMaterials', []);
    await render(
      hbs`<SingleEventLearningmaterialList @learningMaterials={{this.learningMaterials}} />
`
    );
    assert.ok(component.noContent.isVisible);
    assert.ok(component.noContent.text, 'None');
    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('with prework materials', async function (assert) {
    const materials = [
      {
        title: 'first one',
        mimetype: 'application/pdf',
        absoluteFileUri: 'http://firstlink',
      },
      {
        title: 'second one',
        mimetype: 'audio/wav',
      },
    ];
    const prework = [
      {
        name: 'prework 1',
        slug: 'prework1',
        isBlanked: false,
        isPublished: true,
        isScheduled: false,
        learningMaterials: [
          {
            sessionLearningMaterial: '1',
            title: 'aardvark',
            link: 'https://iliosproject.org/',
            position: 2,
          },
          {
            sessionLearningMaterial: '2',
            title: 'foo bar',
            absoluteFileUri: '/dev/null',
            mimetype: 'application/pdf',
            position: 1,
          },
        ],
      },
      {
        name: 'prework 2',
        slug: 'prework2',
        isBlanked: false,
        isPublished: true,
        isScheduled: false,
        learningMaterials: [
          {
            sessionLearningMaterial: '3',
            title: 'readme',
            citation: 'https://iliosproject.org/',
          },
        ],
      },
    ];
    this.set('prework', prework);
    this.set('learningMaterials', materials);
    await render(
      hbs`<SingleEventLearningmaterialList @learningMaterials={{this.learningMaterials}} @prework={{this.prework}} />
`
    );
    assert.strictEqual(component.items.length, 5);
    assert.strictEqual(component.prework.length, 2);
    assert.strictEqual(component.prework[0].name, 'prework 1');
    assert.ok(component.prework[0].url.endsWith('/events/prework1'));
    assert.strictEqual(component.prework[0].items.length, 2);
    assert.strictEqual(component.prework[0].items[0].title, 'aardvark');
    assert.strictEqual(component.prework[0].items[1].title, 'foo bar');
    assert.strictEqual(component.prework[1].name, 'prework 2');
    assert.strictEqual(component.prework[1].items.length, 1);
    assert.strictEqual(component.prework[1].items[0].title, 'readme');
    assert.ok(component.prework[1].url.endsWith('/events/prework2'));
    assert.strictEqual(component.items[3].title, 'first one');
    assert.strictEqual(component.items[4].title, 'second one');
    assert.notOk(component.noContent.isVisible);
  });
});
