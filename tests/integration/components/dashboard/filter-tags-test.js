import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Integration | Component | dashboard/filter-tags', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    this.server.createList('session-type', 3);
    this.server.createList('course', 3);
    const vocabulary = this.server.create('vocabulary');
    this.server.createList('term', 3, { vocabulary });
    this.set('cohortProxies', [
      { id: 1, displayTitle: 'cohort 1', programTitle: 'program 1' },
      { id: 2, displayTitle: 'cohort 2', programTitle: 'program 1' },
      { id: 3, displayTitle: 'cohort 3', programTitle: 'program 2' },
    ]);
    await render(hbs`<Dashboard::FilterTags
      @selectedCourseLevels={{array 1 2}}
      @selectedSessionTypeIds={{array 2 3}}
      @selectedCohortIds={{array 2 3}}
      @selectedCourseIds={{array 2 3}}
      @selectedTermIds={{array 2 3}}
      @cohortProxies={{this.cohortProxies}}
      @removeCourseLevel={{(noop)}}
      @removeSessionTypeId={{(noop)}}
      @removeCohortId={{(noop)}}
      @removeCourseId={{(noop)}}
      @removeTermId={{(noop)}}
      @clearFilters={{(noop)}}
    />`);

    assert.dom().containsText('Course Level 1');
    assert.dom().containsText('Course Level 2');
    assert.dom().containsText('session type 1');
    assert.dom().containsText('session type 2');
    assert.dom().containsText('cohort 2 program 1');
    assert.dom().containsText('cohort 3 program 2');
    assert.dom().containsText('course 1');
    assert.dom().containsText('course 2');
    assert.dom().containsText('term 1');
    assert.dom().containsText('term 2');
  });
});
