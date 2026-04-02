import fs from 'fs';

const html = fs.readFileSync('seo-test.html', 'utf8');

console.log('Total HTML size:', (html.length / 1024).toFixed(2), 'KB');

const rscIndex = html.indexOf('<script>self.__next_f.push([');
if (rscIndex !== -1) {
    const scriptsSize = html.length - rscIndex;
    console.log('RSC / Scripts section size:', (scriptsSize / 1024).toFixed(2), 'KB');
    
    // Let's sample the largest script strings
    const rscContent = html.substring(rscIndex);
    const matches = [...rscContent.matchAll(/.{1,100}/g)];
}

const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/);
if (headMatch) {
    console.log('Head size:', (headMatch[1].length / 1024).toFixed(2), 'KB');
}

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
    const bodyContent = bodyMatch[1];
    // Exclude scripts at the end if possible, or just measure everything before scripts
    const bodyVisibleEnd = bodyContent.indexOf('<script');
    const bodyVisible = bodyVisibleEnd !== -1 ? bodyContent.substring(0, bodyVisibleEnd) : bodyContent;
    console.log('Body visible HTML size:', (bodyVisible.length / 1024).toFixed(2), 'KB');
    
    // Find what tags are the heaviest
    const svgMatches = bodyContent.match(/<svg[\s\S]*?<\/svg>/g);
    if (svgMatches) {
        const svgSizes = svgMatches.map(svg => svg.length).reduce((a, b) => a + b, 0);
        console.log('Inline SVGs size total:', (svgSizes / 1024).toFixed(2), 'KB');
        console.log('Number of SVGs:', svgMatches.length);
    }
}
