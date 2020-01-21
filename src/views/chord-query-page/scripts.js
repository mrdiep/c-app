var item = window.location.href.split('chord=')[1].split(',');
item.forEach(element => {
    if (element.trim()) $('#visual-box-chords').append('<div class="jtab">'+ element.trim() +'</div>');
});
jtab.renderimplicit(null);

window.__IS_MOBILE = /(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i.test(navigator.userAgent);

var chords = item;
var sameScale = ["Db", "C#", "Eb", "D#", "Gb", "F#", "Ab", "G#", "Bb", "A#"];
var scale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

function transposeChord(chord, amount) {
    if (!chord)
      return;
  
    return chord.toLowerCase()
      .replace(/\/./, char => char.toUpperCase())
      .replace(/^./, char => char.toUpperCase())
      .replace(/[DEGAB]b/, match => sameScale[(sameScale.indexOf(match) + 1)])
      .replace(/[CDEFGAB]#?/g, match => {
        const i = (scale.indexOf(match) + amount) % scale.length;
        return scale[i < 0 ? i + scale.length : i];
      })
      .replace(/^A#/, 'Bb')
      .replace(/^D#/, 'Eb');
  }
  
  function changeAllTone(isUp) {
      var newChords = [];
      $('#visual-box-chords').html('');
    chords.forEach(c => {
        var newChord = transposeChord(c, isUp ? 1 : -1);
        newChords.push(newChord);
        if (newChord.trim()) $('#visual-box-chords').append('<div class="jtab">'+ newChord +'</div>');
    });

    chords = newChords;
    jtab.renderimplicit(null);

  }
  