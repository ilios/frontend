/**
 * Get a human readable file bytes from bytes
 * modified from http://stackoverflow.com/a/20732091/796999
 */
export default function readableFilebytes(bytes) {
  if (bytes === 0) {
    return '0 b';
  }
  let i = Math.floor( Math.log(bytes) / Math.log(1024) );
  return ( bytes / Math.pow(1024, i) ).toFixed(0) * 1 + ' ' + ['b', 'kB', 'MB', 'GB', 'TB'][i];
}
