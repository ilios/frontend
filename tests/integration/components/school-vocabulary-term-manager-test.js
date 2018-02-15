import EmberObject from '@ember/object';
import RSVP from 'rsvp';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const { resolve } = RSVP;

moduleForComponent('school-vocabulary-term-manager', 'Integration | Component | school vocabulary term manager', {
  integration: true
});

test('it renders', function(assert) {
  assert.expect(7);
  let allParents = resolve([
    {id: 1, title: 'first'},
    {id: 2, title: 'second'},
  ]);
  let children = resolve([]);
  let vocabulary = EmberObject.create({
    title: 'fake vocab'
  });
  let title = 'fake term';
  let description = 'fake tescription';
  let term = EmberObject.create({
    allParents,
    children,
    vocabulary: resolve(vocabulary),
    title,
    description
  });
  this.set('term', term);
  this.set('vocabulary', vocabulary);
  this.on('nothing', parseInt);
  this.render(hbs`{{
    school-vocabulary-term-manager
    term=term
    vocabulary=vocabulary
    manageTerm=(action 'nothing')
    manageVocabulary=(action 'nothing')
  }}`);

  const all = '.breadcrumbs span:eq(0)';
  const vocab = '.breadcrumbs span:eq(1)';
  const firstParent = '.breadcrumbs span:eq(3)';
  const secondParent = '.breadcrumbs span:eq(2)';
  const termCrumb = '.breadcrumbs span:eq(4)';

  const termTitle = '.term-title .editinplace';
  const termDescription = '.term-description .editinplace';
  assert.equal(this.$(all).text().trim(), 'All Vocabularies');
  assert.equal(this.$(vocab).text().trim(), vocabulary.title);
  assert.equal(this.$(firstParent).text().trim(), 'first');
  assert.equal(this.$(secondParent).text().trim(), 'second');
  assert.equal(this.$(termCrumb).text().trim(), title);
  assert.equal(this.$(termTitle).text().trim(), title);
  assert.equal(this.$(termDescription).text().trim(), description);
});

test('activate inactive term', async function(assert) {
  assert.expect(3);
  let vocabulary = EmberObject.create({
    title: 'fake vocab'
  });
  let title = 'fake term';
  let description = 'fake tescription';
  let term = EmberObject.create({
    children: resolve([]),
    vocabulary: resolve(vocabulary),
    title,
    description,
    active: false,
    save() {
      return resolve(this);
    }
  });
  this.set('term', term);
  this.set('vocabulary', vocabulary);
  this.on('nothing', parseInt);
  this.render(hbs`{{
    school-vocabulary-term-manager
    term=term
    vocabulary=vocabulary
    manageTerm=(action 'nothing')
    manageVocabulary=(action 'nothing')
  }}`);

  const toggle = `.is-active .switch`;
  const toggleValue = `${toggle} input`;
  assert.notOk(this.$(toggleValue).is(':checked'));
  this.$(toggle).click();
  await wait();
  assert.ok(term.get('active'));
  assert.ok(this.$(toggleValue).is(':checked'));
});

test('inactive active term', async function(assert) {
  assert.expect(3);
  let vocabulary = EmberObject.create({
    title: 'fake vocab'
  });
  let title = 'fake term';
  let description = 'fake tescription';
  let term = EmberObject.create({
    children: resolve([]),
    vocabulary: resolve(vocabulary),
    title,
    description,
    active: true,
    save() {
      return resolve(this);
    }
  });
  this.set('term', term);
  this.set('vocabulary', vocabulary);
  this.on('nothing', parseInt);
  this.render(hbs`{{
    school-vocabulary-term-manager
    term=term
    vocabulary=vocabulary
    manageTerm=(action 'nothing')
    manageVocabulary=(action 'nothing')
  }}`);

  const toggle = `.is-active .switch`;
  const toggleValue = `${toggle} input`;
  assert.ok(this.$(toggleValue).is(':checked'));
  this.$(toggle).click();
  await wait();
  assert.notOk(term.get('active'));
  assert.notOk(this.$(toggleValue).is(':checked'));
});
