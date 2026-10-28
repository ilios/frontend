const { styleText } = require('node:util');

class RadReporter {
  constructor(silent, out) {
    this.out = out || process.stdout;
    this.total = 0;
    this.lineLength = 0;
    this.passed = 0;
    this.skipped = 0;
    this.todo = 0;
    this.failedTests = [];
  }

  report(prefix, data) {
    this.total++;
    if (data.passed) {
      this.passed++;
      this.out.write('.');
    } else if (data.skipped) {
      this.skipped++;
      this.out.write('S');
    } else if (data.todo) {
      this.todo++;
      this.out.write('T');
    } else {
      this.failedTests.push(data.originalResultObj.testId);
      this.out.write(styleText('red', 'F'));
    }

    this.printProgress();
  }

  printProgress() {
    this.lineLength++;
    const width = this.out.columns ?? process.stdout.columns ?? 80;
    if (this.lineLength < width - 5) {
      return;
    }

    this.out.write(` ${this.total}\n`);
    this.lineLength = 0;
  }

  finish() {
    const total = this.total - this.skipped - this.todo;
    this.out.write(`${this.passed}/${total} test(s) passed\n`);
    if (this.skipped) {
      this.out.write(`${this.skipped} test(s) skipped\n`);
    }
    if (this.todo) {
      this.out.write(`${this.todo} test(s) marked todo\n`);
    }

    if (this.failedTests.length === 0) {
      return;
    }

    this.out.write(styleText('red', `${this.failedTests.length} test(s) failed\n`));

    const query = this.failedTests
      .map((testId) => `testId=${encodeURIComponent(testId)}`)
      .join('&');

    this.out.write(`\nRe-run failed tests: http://localhost:4200/tests?${query}\n\n`);
  }
}

module.exports = RadReporter;
