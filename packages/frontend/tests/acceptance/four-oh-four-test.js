import { currentRouteName, currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupAuthentication } from 'ilios-common';
import { setupApplicationTest, takeScreenshot } from 'frontend/tests/helpers';

module('Acceptance | FourOhFour', function (hooks) {
  setupApplicationTest(hooks);

  test('visiting /four-oh-four', async function (assert) {
    await setupAuthentication();
    await visit('/four-oh-four');
    await takeScreenshot(assert);

    assert.strictEqual(currentRouteName(), 'four-oh-four');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting /nothing', async function (assert) {
    await setupAuthentication();
    await visit('/nothing');
    assert.strictEqual(currentRouteName(), 'four-oh-four');
  });

  test('visiting missing course', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/courses/1337');
    assert.strictEqual(currentURL(), '/courses/1337');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting existing course does NOT trigger 404', async function (assert) {
    const school = await this.server.create('school');
    const course = await this.server.create('course', { school });
    await setupAuthentication({ directedCourses: [course] });

    await visit('/courses/1');
    assert.strictEqual(currentURL(), '/courses/1');
    assert.dom('.full-screen-error').doesNotExist();
  });

  test('visiting missing session', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/courses/1337/sessions/99999');
    assert.strictEqual(currentURL(), '/courses/1337/sessions/99999');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing learner group', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/learnergroups/1776');
    assert.strictEqual(currentURL(), '/learnergroups/1776');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing instructor group', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/instructorgroups/9001');
    assert.strictEqual(currentURL(), '/instructorgroups/9001');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing school', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/schools/99');
    assert.strictEqual(currentURL(), '/schools/99');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing program', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/programs/135');
    assert.strictEqual(currentURL(), '/programs/135');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing report #5127', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/reports/subjects/1989');
    assert.strictEqual(currentURL(), '/reports/subjects/1989');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing user #1111', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/users/1111');
    assert.strictEqual(currentURL(), '/users/1111');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });

  test('visiting missing curriculum inventory report #6324', async function (assert) {
    const school = await this.server.create('school');
    await setupAuthentication({ directedSchools: [school] });
    await visit('/reports/subjects/2525');
    assert.strictEqual(currentURL(), '/reports/subjects/2525');
    assert
      .dom('.full-screen-error')
      .hasText(
        "Rats! I couldn't find that. Please check your page address, and try again. Back to Dashboard",
      );
  });
});
