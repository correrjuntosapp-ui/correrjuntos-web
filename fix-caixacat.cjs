const fs = require('fs');
const files = [
  'blog/index.html',
  'blog/en/index.html',
  'blog/related.js',
  'blog/andar-vs-correr.html',
  'blog/en/walking-vs-running.html',
];

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  // Replace any pexels 4720794 URL
  const re = /https:\/\/images\.pexels\.com\/photos\/4720794\/pexels-photo-4720794\.jpeg[^"']*/g;
  const matches = c.match(re);
  if (!matches) { console.log(f + ': no match'); return; }

  let newUrl;
  if (f.includes('related.js'))
    newUrl = 'https://images.pexels.com/photos/10432232/pexels-photo-10432232.jpeg?auto=compress&cs=tinysrgb&w=400&h=200&fit=crop&q=60';
  else if (f.endsWith('index.html'))
    newUrl = 'https://images.pexels.com/photos/10432232/pexels-photo-10432232.jpeg?auto=compress&cs=tinysrgb&w=640&h=360&fit=crop&q=80';
  else
    newUrl = 'https://images.pexels.com/photos/10432232/pexels-photo-10432232.jpeg?auto=compress&cs=tinysrgb&w=1200&h=630&fit=crop&q=80';

  c = c.replace(re, newUrl);
  fs.writeFileSync(f, c);
  console.log(f + ': ' + matches.length + ' replacement(s)');
});
