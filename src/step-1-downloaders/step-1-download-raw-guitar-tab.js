import fs, {
    readdirSync,
    writeFileSync,
    readFileSync,
    existsSync
} from 'fs';
import { join } from 'path';

import axios from 'axios';
import sitemaps from 'sitemap-stream-parser';
read();
async function read() {
    var all = JSON.parse(readFileSync('d:/aaaa.json', 'utf-8'));
    var downloadedCount = readdirSync('d:/raw-guitar').length;
    var totalDownload = all.length;
    for(var link of all) {
        try {
            var segments = link.split('/');
            
            var fileName = segments[segments.length - 1] + '.html'
            if (existsSync(join('d:/raw-guitar', fileName)))
              continue;

            downloadedCount++;
            console.log( (downloadedCount / totalDownload) + '% :: ' + link);
            var res = await axios.get(link);
            
            writeFileSync(join('d:/raw-guitar', fileName), res.data)
        }
        catch(err) {
            console.log(err.toString());
        }
        
    }
}


function getJson() {

    var a = [];
    sitemaps.parseSitemaps('https://www.ultimate-guitar.com/sitemap_last.xml', (data) => {
        a.push(data);

    }, function (err, sitemaps) {
        console.log('All done!');
        console.log(a.length)
        writeFileSync('d:/aaa.json', JSON.stringify(a, null, 4))
    });

    for (var i = 1; i <= 25; i++) {
        sitemaps.parseSitemaps('https://www.ultimate-guitar.com/sitemap' + i + '.xml', (data) => {
            a.push(data);

        }, function (err, sitemaps) {
            console.log('All done!');
            console.log(a.length)
            writeFileSync('d:/aaa.json', JSON.stringify(a, null, 4))
        });
    }
}