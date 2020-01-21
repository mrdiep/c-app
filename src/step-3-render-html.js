import cheerio from 'cheerio';
import {
    readFileSync,
    readdirSync,
    writeFileSync,
    createReadStream,
    mkdirSync,
    existsSync
} from 'fs';
import nodeSass from 'node-sass';

import {
    jsonDataFolder,
    renderFolder
} from './config'

import {
    compileFile as viewCompile,
    render
} from 'pug';
import {
    join
} from 'path';

import rimraf from 'rimraf';

cleanFolder().then(() => {
    renderHtmlFiles();
    renderHomePage();
});

//renderHomePage();
//generateSiteMap();
//renderChordQuery();

function cleanFolder() {
    return new Promise((r, j) => {
        rimraf(renderFolder, () => {
            console.log('Clean folder done: ' + renderFolder);
            if (!existsSync(renderFolder))
                mkdirSync(renderFolder);
            r();
        });
    });
}

function renderHtmlFiles() {
    try {
        const jsonFiles = readdirSync(jsonDataFolder);

        console.log('rendering...')
        console.time('rendering');

        const clientCss = getCss('chord');
        const clientJs = getClientJs('chord');

        for (let jsonFile of jsonFiles) {
            if (jsonFile.startsWith('all'))
                continue;

            const contentHtml = readFileSync(join(jsonDataFolder, jsonFile), 'utf-8');
            var renderedHtml = renderHtml(jsonFile, JSON.parse(contentHtml), clientCss, clientJs);
            var fileName = jsonFile.split('.')[0] + '.htm';
            writeFileSync(join(renderFolder, fileName), renderedHtml, "utf-8");
            console.log('rendered ' + fileName);
        }

        console.timeEnd('rendering');
    } catch (err) {
        console.log(err);
    }
}

function renderHomePage() {
    const jsonFile = readdirSync(jsonDataFolder).filter(x => x.startsWith('all'))[0]

    const clientCss = getCss('home');
    const clientJs = getClientJs('home');

    var records = JSON.parse(readFileSync(join(jsonDataFolder, jsonFile))).map(x => x.split('$'));

    records = records.sort((x, y) => x[1].trim() > y[1].trim() ? 1 : -1);
    var html = viewCompile(join(__dirname, '/views/home-page/ui.pug'))({
        records,
        js: clientJs,
        css: clientCss,
        compressed: JSON.stringify(records)
    });

    writeFileSync('d:/index.html', html);
}

function generateSiteMap() {
    var records = readdirSync(jsonDataFolder);

    var xml = '<?xml version="1.0" encoding="UTF-8"?>';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    for (var item of records) {
        xml += '<url>'

        xml += '<loc>http://hopam.online/hop-am/' + item.split('.')[0] + '.htm</loc>'

        xml += '<lastmod>2018-05-01</lastmod>'

        xml += '<changefreq>monthly</changefreq>'

        xml += '<priority>0.8</priority>'

        xml += '</url>'
    }

    xml += '</urlset>'

    writeFileSync('D:/sitemap_47376.xml', xml)
}

function renderChordQuery() {

    const clientCss = getCss('chord-query');
    const clientJs = getClientJs('chord-query');
    var html = viewCompile(join(__dirname, '/views/chord-query-page/ui.pug'))({
        js: clientJs,
        css: clientCss
    });

    writeFileSync('d:/chord-viewer.htm', html);
}


function getCss(pageName) {
    return nodeSass.renderSync({
        file: 'src/views/' + pageName + '-page/styles.scss'
    }).css.toString('utf-8');
}

function getClientJs(pageName) {
    return readFileSync(join(__dirname, '/views/' + pageName + '-page/scripts.js'));
}

function renderHtml(fileName, jsonData, clientCss, clientJs) {
    var chordHtml = '<div>';
    if (!jsonData.chordLines) {
        console.error('empty' + jsonData)
    }
    for (var line of jsonData.chordLines || []) {
        if (line.indexOf('[') === -1) {
            chordHtml += '<div class="chord-line">' + line + '</div>';
            continue;
        };

        chordHtml += '<div class="chord-line"><span>' +
            line
            .replace(/\[/gm, '</span><span class="chord-inline"><i>[</i><b>')
            .replace(/\]/gm, '</b><i>]</i></span><span>') +
            '</span></div>'
    }

    chordHtml += '</div>';
    return viewCompile(join(__dirname, '/views/chord-page/ui.pug'))({
        css: clientCss,
        js: clientJs,
        chordHtml,
        title: jsonData.title,
        singers: jsonData.singers,
        authors: jsonData.authors,
        chords: jsonData.chords,
        fileName,
        metaProperties: getMetaProperties(fileName, jsonData),
        metaNames: getMetaNames(fileName, jsonData)
    });
}

function getMetaProperties(fileName, jsonData) {
    return [{
            property: "og:title",
            content: jsonData.title + ' - ' + jsonData.singers.join(', ') + ' - ' + jsonData.authors.join(', ') + ' - Hợp âm guitar '
        },
        {
            property: "og:site_name",
            content: 'hopam.online'
        },
        {
            property: "og:url",
            content: 'http://hopam.online/logo.png'
        },
        {
            property: "og:url",
            content: 'http://hopam.online/hop-am/' + fileName.split('.')[0] + '.htm'
        },
        {
            property: "og:description",
            content: jsonData.lyric.substring(0, 150).replace(/\r\n/g, ' ')
        },
        {
            property: "og:type",
            content: 'article'
        }
    ]
}

function getMetaNames(fileName, jsonData) {
    return [{
            name: "robots",
            content: "noodp,index,follow"
        },
        {
            name: "description",
            content: jsonData.lyric.substring(0, 150).replace(/\r\n/g, ' ')
        },
        {
            name: "keywords",
            content: ["hợp âm " + jsonData.title, "hợp âm guitar", "hop am guitar", "hoc choi dan", 
            "học đàn guitar", "lời nhạc", "danh dan guitar", "bài hát " + jsonData.title].join(',')
        },
        {
            name: "user",
            content: 'false'
        },
        {
            name: "revisit-after",
            content: '30 days'
        }
    ]
}