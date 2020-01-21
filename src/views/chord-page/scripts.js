(function (d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = 'https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v3.0&appId=1459634534313580&autoLogAppEvents=1';
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.__IS_MOBILE = /(android|avantgo|blackberry|bolt|boost|cricket|docomo|fone|hiptop|mini|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i.test(navigator.userAgent);

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
  var x = $('.chord-line b');
  for (let i = 0; i < x.length; i++)
    x[i].innerHTML = transposeChord(x[i].innerHTML, isUp ? 1 : -1);
}

function changeFontSize(v) {
  $(".chord-line").css({
    fontSize: parseInt($(".chord-line").css('font-size')) + v + 'px'
  });

  $(".chord-line b").css({
    fontSize: parseInt($(".chord-line b").css('font-size')) + v + 'px'
  });
}

function devideCol(v) {
  $('.chord-content').css({
    columnCount: v
  })

  $('.chord-line').css({
    borderRight: v == 1 ? "none" : "2px dashed gray"
  })
}

function combineChord(v) {
  if (v) {
    $('.chord-line .chord-inline').css({
      position: 'inherit'
    })

    $('.chord-line .chord-inline i').css({
      display: 'inherit',
      fontStyle: 'normal'
    })

    return;
  }

  $('.chord-line .chord-inline').css({
    position: 'absolute'
  })

  $('.chord-line .chord-inline i').css({
    display: 'none'
  })
}