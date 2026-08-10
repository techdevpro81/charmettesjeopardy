const https = require('https');

https.get('https://www.101soundboards.com/boards/27855-jeopardy-sounds', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const links = data.match(/\/storage\/board_sounds_rendered\/[^"]+\.mp3/g);
      if (links) {
         console.log(links.slice(0, 10));
      } else {
         console.log('No mp3s found');
      }
    } catch(e) { console.error(e); }
  });
});
