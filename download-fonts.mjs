import fs from 'fs';
import https from 'https';
import path from 'path';

const cssUrl = 'https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400,800&display=swap';

https.get(cssUrl, (res) => {
  let css = '';
  res.on('data', chunk => css += chunk);
  res.on('end', () => {
    const urls = [...css.matchAll(/url\('(https:\/\/[^']+\.woff2)'\)/g)].map(m => m[1]);
    const weightsMatch = css.match(/font-weight:\s*(\d+);/g);
    
    // We'll write a mapping of the files downloaded
    const fontMapping = [];

    urls.forEach((url, i) => {
      const filename = url.split('/').pop();
      console.log(`Downloading ${filename}...`);
      https.get(url, (fontRes) => {
        const dest = fs.createWriteStream(`src/fonts/${filename}`);
        fontRes.pipe(dest);
        dest.on('finish', () => console.log(`Saved src/fonts/${filename}`));
      });
    });
  });
}).on('error', (err) => console.error(err));
