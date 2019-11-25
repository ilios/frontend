/**
 * Stolen from https://github.com/auth0/jwt-decode/blob/master/lib/base64_url_decode.js
 */
const b64DecodeUnicode = function (str) {
  return decodeURIComponent(atob(str).replace(/(.)/g, function (m, p) {
    let code = p.charCodeAt(0).toString(16).toUpperCase();
    if (code.length < 2) {
      code = '0' + code;
    }
    return '%' + code;
  }));
};

export default function jwtDecode(token) {
  const parts = token.split('.');
  const body = parts[1];
  return JSON.parse(b64DecodeUnicode(body));
}
