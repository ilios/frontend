import { module, test } from 'qunit';
import { setupRenderingTest } from 'test-app/tests/helpers';
import { render } from '@ember/test-helpers';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { component } from 'ilios-common/page-objects/components/dashboard/terms-calendar-filter';
import { a11yAudit } from 'ember-a11y-testing/test-support';
import TermsCalendarFilter from 'ilios-common/components/dashboard/terms-calendar-filter';
import noop from 'ilios-common/helpers/noop';
import { array } from '@ember/helper';

module('Integration | Component | dashboard/terms-calendar-filter', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    this.school = this.server.create('school');
    this.vocab1 = this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    const term1 = this.server.create('term', {
      vocabulary: this.vocab1,
      active: true,
    });
    const term2 = this.server.create('term', {
      vocabulary: this.vocab1,
      active: true,
    });
    this.vocab2 = this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    const term3 = this.server.create('term', {
      vocabulary: this.vocab2,
      active: true,
    });
    const term4 = this.server.create('term', {
      vocabulary: this.vocab2,
      active: true,
    });
    this.server.create('course', {
      year: 2024,
      school: this.school,
      terms: [term1, term2],
    });
    this.server.create('course', {
      year: 2025,
      school: this.school,
      terms: [term3, term4],
    });

    this.vocabModel1 = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', this.vocab1.id);
    this.vocabModel2 = await this.owner
      .lookup('service:store')
      .findRecord('vocabulary', this.vocab2.id);
  });

  test('it renders and is accessible', async function (assert) {
    await render(
      <template>
        <TermsCalendarFilter
          @addTermId={{(noop)}}
          @removeTermId={{(noop)}}
          @vocabularies={{array this.vocabModel1 this.vocabModel2}}
        />
      </template>,
    );

    assert.strictEqual(component.vocabularies.length, 2, 'vocabulary count is correct');
    assert.strictEqual(
      component.vocabularies[0].title,
      'Vocabulary 1',
      'first vocabulary title is correct',
    );
    assert.strictEqual(
      component.vocabularies[1].title,
      'Vocabulary 2',
      'second vocabulary title is correct',
    );

    assert.strictEqual(
      component.vocabularies[0].terms.length,
      2,
      'first vocabulary terms count is correct',
    );
    assert.strictEqual(
      component.vocabularies[0].terms[0].title,
      'term 0',
      'first vocabulary, first term title is correct',
    );
    assert.strictEqual(
      component.vocabularies[0].terms[1].title,
      'term 1',
      'first vocabulary, second term title is correct',
    );

    assert.strictEqual(
      component.vocabularies[1].terms.length,
      2,
      'second vocabulary terms count is correct',
    );
    assert.strictEqual(
      component.vocabularies[1].terms[0].title,
      'term 2',
      'second vocabulary, first term title is correct',
    );
    assert.strictEqual(
      component.vocabularies[1].terms[1].title,
      'term 3',
      'second vocabulary, second term title is correct',
    );

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  test('selected terms are checked', async function (assert) {
    await render(
      <template>
        <TermsCalendarFilter
          @selectedTermIds={{array "2" "3"}}
          @addTermId={{(noop)}}
          @removeTermId={{(noop)}}
          @vocabularies={{array this.vocabModel1 this.vocabModel2}}
        />
      </template>,
    );
    assert.strictEqual(component.vocabularies[0].terms.length, 2);

    assert.strictEqual(component.vocabularies[0].terms[0].title, 'term 0');
    assert.notOk(component.vocabularies[0].terms[0].isChecked);

    assert.strictEqual(component.vocabularies[0].terms[1].title, 'term 1');
    assert.ok(component.vocabularies[0].terms[1].isChecked);

    assert.strictEqual(component.vocabularies[1].terms[0].title, 'term 2');
    assert.ok(component.vocabularies[1].terms[0].isChecked);

    assert.strictEqual(component.vocabularies[1].terms[1].title, 'term 3');
    assert.notOk(component.vocabularies[1].terms[1].isChecked);
  });

  test('selected terms toggle remove', async function (assert) {
    assert.expect(2);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <TermsCalendarFilter
          @selectedTermIds={{array "1"}}
          @addTermId={{(noop)}}
          @removeTermId={{this.remove}}
          @vocabularies={{array this.vocabModel1 this.vocabModel2}}
        />
      </template>,
    );
    assert.ok(component.vocabularies[0].terms[0].isChecked);
    await component.vocabularies[0].terms[0].toggle();
  });

  test('unselected terms toggle add', async function (assert) {
    assert.expect(2);
    this.set('add', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <TermsCalendarFilter
          @addTermId={{this.add}}
          @removeTermId={{(noop)}}
          @vocabularies={{array this.vocabModel1 this.vocabModel2}}
        />
      </template>,
    );
    assert.notOk(component.vocabularies[0].terms[0].isChecked);
    await component.vocabularies[0].terms[0].toggle();
  });
});
