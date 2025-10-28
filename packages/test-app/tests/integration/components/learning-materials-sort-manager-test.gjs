import { setupRenderingTest } from 'test-app/tests/helpers';
import { render, click, find } from '@ember/test-helpers';
import { module, skip, test } from 'qunit';
import { setupMirage } from 'test-app/tests/test-support/mirage';
import { capitalize } from '@ember/string';
import LearningMaterialsSortManager from 'ilios-common/components/learning-materials-sort-manager';
import noop from 'ilios-common/helpers/noop';

module('Integration | Component | learning materials sort manager', function (hooks) {
  setupRenderingTest(hooks);
  setupMirage(hooks);

  test('it renders', async function (assert) {
    const user1 = this.server.create('user', {
      firstName: 'Hans',
      lastName: 'Wurst',
    });
    const user2 = this.server.create('user', {
      firstName: 'Hans',
      lastName: 'Dampf',
    });
    const status1 = this.server.create('learning-material-status', {
      title: 'Done and done',
    });
    const status2 = this.server.create('learning-material-status', {
      title: 'Draft',
    });
    const lm1 = this.server.create('learning-material', {
      title: 'Lorem Ipsum',
      status: status1,
      owningUser: user1,
      filename: 'loremipsum.txt',
      mimetype: 'application/pdf',
    });
    const lm2 = this.server.create('learning-material', {
      title: 'Foo Bar',
      status: status2,
      owningUser: user2,
      citation: 'Lorem Ipsum',
    });
    const clm1 = this.server.create('course-learning-material', {
      learningMaterial: lm1,
      position: 1,
    });
    const clm2 = this.server.create('course-learning-material', {
      learningMaterial: lm2,
      position: 0,
    });
    const course = this.server.create('course', {
      learningMaterials: [clm1, clm2],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const statusModel1 = await this.owner
      .lookup('service:store')
      .findRecord('learning-material-status', status1.id);
    const statusModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learning-material-status', status2.id);
    const userModel1 = await this.owner.lookup('service:store').findRecord('user', user1.id);
    const userModel2 = await this.owner.lookup('service:store').findRecord('user', user2.id);
    const lmModel1 = await this.owner
      .lookup('service:store')
      .findRecord('learning-material', lm1.id);
    const lmModel2 = await this.owner
      .lookup('service:store')
      .findRecord('learning-material', lm2.id);
    this.set('subject', courseModel);
    await render(
      <template>
        <LearningMaterialsSortManager @subject={{this.subject}} @cancel={{(noop)}} />
      </template>,
    );
    assert.dom('.item').exists({ count: 2 });
    assert.dom('.item:nth-of-type(1) [data-test-title]').hasText(lmModel2.title);
    assert
      .dom('.item:nth-of-type(1) [data-test-lm-type-icon].fa-paragraph')
      .exists({ count: 1 }, 'Shows LM type icon.');
    assert.strictEqual(
      find('.item:nth-of-type(1) .details').textContent.replace(/[\s\n\t]+/g, ''),
      `${capitalize(lmModel2.type)}, owned by ${userModel2.fullName}, Status: ${
        statusModel2.title
      }`.replace(/[\s\n\t]+/g, ''),
    );
    assert.dom('.item:nth-of-type(2) [data-test-title]').hasText(lmModel1.title);
    assert
      .dom('.item:nth-of-type(2) [data-test-lm-type-icon].fa-file-pdf')
      .exists({ count: 1 }, 'Shows LM type icon.');
    assert.strictEqual(
      find('.item:nth-of-type(2) .details').textContent.replace(/[\s\n\t]+/g, ''),
      `${capitalize(lmModel1.type)}, owned by ${userModel1.fullName}, Status: ${
        statusModel1.title
      }`.replace(/[\s\n\t]+/g, ''),
    );
    assert.dom('.actions .bigadd').exists({ count: 1 });
    assert.dom('.actions .bigcancel').exists({ count: 1 });
  });

  test('cancel', async function (assert) {
    const owningUser = this.server.create('user', {
      firstName: 'foo',
      lastName: 'bar',
    });
    const status = this.server.create('learning-material-status', { title: 'Something' });
    const learningMaterial1 = this.server.create('learning-material', {
      owningUser,
      status,
      title: 'First',
      citation: 'Lorem Ipsum',
    });
    const learningMaterial2 = this.server.create('learning-material', {
      owningUser,
      status,
      title: 'Second',
      citation: 'Lorem Ipsum',
    });
    const clm1 = this.server.create('course-learning-material', {
      learningMaterial: learningMaterial1,
    });
    const clm2 = this.server.create('course-learning-material', {
      learningMaterial: learningMaterial2,
    });
    const course = this.server.create('course', {
      learningMaterials: [clm1, clm2],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    this.set('subject', courseModel);
    this.set('cancel', () => {
      assert.step('cancel called');
    });
    await render(
      <template>
        <LearningMaterialsSortManager @subject={{this.subject}} @cancel={{this.cancel}} />
      </template>,
    );
    await click('.actions .bigcancel');
    assert.verifySteps(['cancel called']);
  });

  test('save', async function (assert) {
    const owningUser = this.server.create('user', {
      firstName: 'foo',
      lastName: 'bar',
    });
    const status = this.server.create('learning-material-status', { title: 'Something' });
    const learningMaterial1 = this.server.create('learning-material', {
      owningUser,
      status,
      title: 'First',
      citation: 'Lorem Ipsum',
    });
    const learningMaterial2 = this.server.create('learning-material', {
      owningUser,
      status,
      title: 'Second',
      citation: 'Lorem Ipsum',
    });
    const clm1 = this.server.create('course-learning-material', {
      learningMaterial: learningMaterial1,
      position: 1,
    });
    const clm2 = this.server.create('course-learning-material', {
      learningMaterial: learningMaterial2,
      position: 2,
    });
    const course = this.server.create('course', {
      learningMaterials: [clm1, clm2],
    });
    const courseModel = await this.owner.lookup('service:store').findRecord('course', course.id);
    const clmModel1 = await this.owner
      .lookup('service:store')
      .findRecord('course-learning-material', clm1.id);
    const clmModel2 = await this.owner
      .lookup('service:store')
      .findRecord('course-learning-material', clm2.id);
    this.set('subject', courseModel);
    this.set('save', (data) => {
      assert.step('save called');
      assert.strictEqual(data.length, 2);
      assert.ok(data.includes(clmModel1));
      assert.ok(data.includes(clmModel2));
    });
    await render(
      <template>
        <LearningMaterialsSortManager
          @subject={{this.subject}}
          @save={{this.save}}
          @cancel={{(noop)}}
        />
      </template>,
    );
    await click('.actions .bigadd');
    assert.verifySteps(['save called']);
  });

  skip('reorder and save', function (assert) {
    assert.ok(false);
    // @todo figure out how to simulate drag and drop and implement this test [ST 2017/02/13]
  });
});
