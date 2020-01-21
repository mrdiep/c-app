import fs, { readdirSync } from 'fs';
import axios from 'axios';
import header from './step-1-config/header';

import { rawHtmlFolder } from './config'
import { join } from 'path';

const httpOk = 200;
const notFoundCounterResetValue = 0;

function getLastSongId() {
    var fileHtmls = readdirSync(rawHtmlFolder);
    var fileInt = fileHtmls.map(x=> parseInt(x.split('.')[0]));
    
    fileInt = fileInt.sort((x,y) => y - x);
    if (fileInt.length) {
        return fileInt[0];
    }

    return 1;    
}

function getFailedSongIds() {
    var fileHtmls = readdirSync(rawHtmlFolder);
    var fileInt = fileHtmls.map(x=> parseInt(x.split('.')[0]));
    
    fileInt = fileInt.sort((x,y) => y - x);
    if (fileInt.length <= 1) {
        return [];
    }

    var newArr = [];
    for(var i = 1; i < fileInt[0]; i++) {
        if (fileInt.indexOf(i) === -1) {
            newArr.push(i);
        }
    }

    return newArr;    
}

async function downloadAndSave() {
    var songId = getLastSongId();
    let notFoundCounter = notFoundCounterResetValue;
    while(notFoundCounter < 50) {
        songId++;
        try {
            var res = await axios.get(`https://hopamchuan.com/song/${songId}/a`,header);
            if (res.status == httpOk) {
                fs.writeFileSync(join(rawHtmlFolder, `${songId}.html`), res.data)
                console.log('Downloaded: ' + songId + ' - ' + new Date())
                notFoundCounter = notFoundCounterResetValue;
            }
        } catch (err) {
            notFoundCounter++;
            console.log('download failed: ' + songId + ' ' + err);
        }
    }
}

async function downloadFailed() {
    var songIds = getFailedSongIds();
    for(var songId of songIds) {
        try {
            var res = await axios.get(`https://hopamchuan.com/song/${songId}/a`,header);
            if (res.status == httpOk) {
                fs.writeFileSync(join(rawHtmlFolder, `${songId}.html`), res.data)
                console.log('Downloaded: ' + songId + ' - ' + new Date())
            }
        } catch (err) {
            console.log('download failed: ' + songId + ' ' + err);
        }
    }
}

downloadAndSave();
downloadFailed();