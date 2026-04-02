import fs from 'fs';

const html = fs.readFileSync('seo-test.html', 'utf8');
const rscMatch = html.substring(html.indexOf('<script>self.__next_f.push('));
const matches = [...rscMatch.matchAll(/"([^"]{100,})"/g)];
const longest = matches.sort((a,b) => b[1].length - a[1].length).slice(0, 5);

longest.forEach(m => {
    console.log('Match Length:', m[1].length);
    console.log('Sample:', m[1].substring(0, 200), '...\n');
});

console.log('There are', matches.length, 'strings over 100 chars in scripts block.');
