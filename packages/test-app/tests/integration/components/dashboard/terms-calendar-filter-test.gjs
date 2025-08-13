import { module, skip, test } from 'qunit';
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
    this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    this.server.create('vocabulary', {
      school: this.school,
      active: true,
    });
    this.server.create('term', {
      vocabularyId: 1,
      active: true,
    });
    this.server.create('term', {
      vocabularyId: 1,
      active: true,
    });
    this.server.create('term', {
      vocabularyId: 2,
      active: true,
    });
    this.server.create('term', {
      vocabularyId: 2,
      active: true,
    });
  });

  test('it renders and is accessible', async function (assert) {
    await render(
      <template>
        <TermsCalendarFilter
          @school={{this.school}}
          @addTermId={{(noop)}}
          @removeTermId={{(noop)}}
          @vocabularies={{this.vocabularies}}
        />
      </template>,
    );

    // assert.strictEqual(component.vocabularies.length, 2);
    // assert.strictEqual(parseInt(component.years[0].title, 10), thisYear + 1);
    // assert.strictEqual(parseInt(component.years[1].title, 10), thisYear);
    // assert.strictEqual(parseInt(component.years[2].title, 10), thisYear - 1);

    // assert.ok(component.years[0].isExpanded);
    // assert.notOk(component.years[1].isExpanded);
    // assert.notOk(component.years[2].isExpanded);

    // assert.strictEqual(component.years[0].courses.length, 2);
    // assert.strictEqual(component.years[1].courses.length, 0);
    // assert.strictEqual(component.years[2].courses.length, 0);

    // assert.strictEqual(component.years[0].courses[0].title, 'course 2 (1)');
    // assert.strictEqual(component.years[0].courses[1].title, 'course 3 (1)');

    await a11yAudit(this.element);
    assert.ok(true, 'no a11y errors found!');
  });

  skip('selected terms are checked', async function (assert) {
    await render(
      <template>
        <TermsCalendarFilter
          @school={{this.school}}
          @selectedTermIds={{array "2" "3"}}
          @addTermId={{(noop)}}
          @removeTermId={{(noop)}}
        />
      </template>,
    );
    assert.strictEqual(component.years[0].courses.length, 4);
    assert.strictEqual(component.years[0].courses[0].title, 'course 0');
    assert.notOk(component.years[0].courses[0].isChecked);

    assert.strictEqual(component.years[0].courses[1].title, 'course 1');
    assert.ok(component.years[0].courses[1].isChecked);

    assert.strictEqual(component.years[0].courses[2].title, 'course 2');
    assert.ok(component.years[0].courses[2].isChecked);

    assert.strictEqual(component.years[0].courses[3].title, 'course 3');
    assert.notOk(component.years[0].courses[3].isChecked);
  });

  skip('selected terms toggle remove', async function (assert) {
    assert.expect(2);
    this.set('remove', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <TermsCalendarFilter
          @school={{this.school}}
          @selectedTermIds={{array "1"}}
          @addTermId={{(noop)}}
          @removeTermId={{this.remove}}
        />
      </template>,
    );
    assert.ok(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
  });

  skip('unselected terms toggle add', async function (assert) {
    assert.expect(2);
    this.set('add', (id) => {
      assert.strictEqual(id, '1');
    });
    await render(
      <template>
        <TermsCalendarFilter
          @school={{this.school}}
          @addTermId={{this.add}}
          @removeTermId={{(noop)}}
        />
      </template>,
    );
    assert.notOk(component.years[0].courses[0].isChecked);
    await component.years[0].courses[0].toggle();
  });
});
