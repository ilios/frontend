const types = ['major', 'minor', 'patch'];
if (!types.includes(process.env.releaseType)) {
  console.log(`${process.env.releaseType} is not a valid release type. Must be ones of ` + types.join(', '));
  process.exit(1);
}