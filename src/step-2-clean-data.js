import cheerio from 'cheerio';
import {
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync
} from 'fs';
import {
    uniq as distinct
} from 'lodash';

import {
    rawHtmlFolder,
    jsonDataFolder
} from './config'
import {
    join
} from 'path';

import rimraf from 'rimraf';

async function cleanFolder() {
    return new Promise((r, j) => {
        rimraf(jsonDataFolder, function () {
            console.log('clean folder done: ' + jsonDataFolder);
            mkdirSync(jsonDataFolder);
            r();
        });
    });
}

cleanFolder().then(cleanNow);

function cleanNow() {
    console.log('refining data...')
    console.time('refining data');

    const data = [];
    const rawHtmlFiles = readdirSync(rawHtmlFolder);
    for (let rawHtmlFile of rawHtmlFiles) {
        const contentHtml = readFileSync(join(rawHtmlFolder, rawHtmlFile), 'utf-8');
        var parsedData = clean(contentHtml);
        var json = JSON.stringify(parsedData, null, 4);
        writeFileSync(join(jsonDataFolder, rawHtmlFile.split('.')[0] + '.json'), json, "utf-8");
        console.log('done: ' + rawHtmlFile);
        parsedData.id=rawHtmlFile.split('.')[0];
        data.push(parsedData);
    }

    var now = new Date();
    writeFileSync(join(jsonDataFolder, '../all_' + now.getFullYear() + "_" + now.getMonth() + "_" + now.getDate() + "-" + now.getHours() + "_" + now.getMinutes() + "_" + now.getSeconds() + '_' + now.getMilliseconds() + '.json'), 
    JSON.stringify(data.map(x =>  x.id + '$' + x.title + '$' + x.singers.join(',') + '$' + x.authors.join(',')), null, 4));

    console.timeEnd('refining data');
}

function clean(htmlContent) {
    var $ = cheerio.load(htmlContent, {
        decodeEntities: false
    });

    var title = $('#song-title span').html();
    var rhythm = $('#display-rhythm').attr('data-rhythm');

    var singers = $('#song-author .author-item').map((index, node) => $(node).text()).get().filter(x => x).map(x => x.trim());

    var authors = $('#song-detail-info .author-item').map((index, node) => $(node).text()).get().filter(x => x).map(x => x.trim());

    var chordLines = $('.chord_lyric_line').map((index, node) => $(node).text().trim()).get();

    var chords = refineChords(distinct($('.hopamchuan_chord_inline').map((value, node) => $(node).text()).get()));

    $('.hopamchuan_chord_inline').remove();
    var lyric = $('.chord_lyric_line').map((index, node) => $(node).text().trim()).get().join('\r\n');

    return {
        title,
        rhythm,
        authors,
        singers,
        lyric,
        chords,
        chordLines
    }
}

function refineChords(chords) {
    return distinct(chords.map(x => x.replace('[', ' ').replace(']', ' ')).join(' ').split(' ').filter(x => x));
}