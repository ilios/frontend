'use strict';

const CachingWriter = require('broccoli-caching-writer');
const path = require('path');
const sharp = require('sharp');
const RSVP = require('rsvp');

class GenerateIcons extends CachingWriter {
  constructor(inputNode, options) {
    super([inputNode], {
      annotation: 'build-ilios-icons'
    });

    sharp.cache(false);
    this.options = options;
  }

  build() {
    const options = this.options;
    const promises = [];
    options.sizes.forEach(size => {
      promises.push(this.writeIcon(size));
    });

    return RSVP.all(promises);
  }
  writeIcon(size) {
    const fileName = `ilios-sunburst${size}.png`;
    const outputPath = path.join(this.outputPath, fileName);
    const originalSvg = path.join(this.inputPaths[0], 'ilios-sunburst.svg');
    return sharp(originalSvg).resize(size).toFile(outputPath);
  }
}

module.exports = GenerateIcons;
