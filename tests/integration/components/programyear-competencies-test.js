import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, find } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

const { resolve } = RSVP;

let school = EmberObject.create({
});
let program = EmberObject.create({
  school: resolve(school)
});
let programYear = EmberObject.create({
  program: resolve(program)
});
let domain1 = EmberObject.create({
  id: 1,
  title: 'domain1',
  programYears: resolve([programYear]),
});
domain1.set('domain', resolve(domain1));
let competency1 = EmberObject.create({
  id: 2,
  domain: resolve(domain1),
  title: 'competency1',
  children: resolve([]),
  programYears: resolve([programYear]),
  treeChildren: resolve([]),
});
let competency2 = EmberObject.create({
  id: 2,
  domain: resolve(domain1),
  title: 'competency2',
  children: resolve([]),
  programYears: resolve([programYear]),
  treeChildren: resolve([]),
});
domain1.set('children', resolve([competency1, competency2]));
domain1.set('treeChildren', resolve([competency1, competency2]));
school.set('competencies', resolve([domain1, competency1, competency2]));
programYear.set('competencies', resolve([competency1, competency2]));


module('Integration | Component | programyear competencies', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    this.set('programYear', programYear);
    this.set('nothing', parseInt);
    await render(hbs`{{programyear-competencies
      programYear=programYear
      canUpdate=true
      isManaging=false
      collapse=(action nothing)
      expand=(action nothing)
      setIsManaging=(action nothing)
    }}`);
    const title = '.title';
    const button = '.programyear-competencies-actions button';
    const list = '.programyear-competencies-content';

    assert.equal(find(title).textContent.trim(), 'Competencies (2)');
    assert.equal(find(button).textContent.trim(), 'Manage Competencies');
    assert.equal(find(list).textContent.replace(/[\t\n\s]+/g, ""), 'domain1competency1competency2');

  });

  test('clicking manage fires action', async function(assert) {
    assert.expect(1);
    this.set('programYear', programYear);
    this.set('nothing', parseInt);
    this.set('setIsManaging', (b => {
      assert.ok(b === true);
    }));
    await render(hbs`{{programyear-competencies
      programYear=programYear
      canUpdate=true
      isManaging=false
      collapse=(action nothing)
      expand=(action nothing)
      setIsManaging=(action setIsManaging)
    }}`);
    const button = '.programyear-competencies-actions button';

    await click(button);
  });

  test('clicking collapse fires action', async function(assert) {
    assert.expect(1);
    this.set('programYear', programYear);
    this.set('nothing', parseInt);
    this.set('collapse', (() => {
      assert.ok(true);
    }));
    await render(hbs`{{programyear-competencies
      programYear=programYear
      isManaging=false
      collapse=(action collapse)
      expand=(action nothing)
      setIsManaging=(action nothing)
    }}`);
    const title = '.title';

    await click(title);
  });
});
