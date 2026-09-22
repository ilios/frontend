import { http, HttpResponse } from 'msw';

// File upload mock
export default http.post('/upload', async () => {
  let hash = '';
  const allowedChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 32; i++) {
    hash += allowedChars.charAt(Math.floor(Math.random() * allowedChars.length));
  }

  return HttpResponse.json({
    filename: 'bogus.txt',
    fileHash: hash,
  });
});
