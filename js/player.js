// ===== player.js - 閹绢厽鏂侀崳銊︾壋韫囧啴鈧槒绶敍鍫熸暜閹镐焦婀伴崷鐗堟瀮娴?+ LRC閿?====

var player = (function() {
  "use strict";

  var audio = new Audio();
  audio.preload = "auto";

  function byId(id) { return document.getElementById(id); }

  var dom = {
    miniCover: byId("miniCover"), miniTitle: byId("miniTitle"), miniArtist: byId("miniArtist"),
    miniPlayBtn: byId("miniPlayBtn"), playerCover: byId("playerCover"),
    playerTitle: byId("playerTitle"), playerArtist: byId("playerArtist"),
    playBtn: byId("playBtn"), progressFill: byId("progressFill"),
    progressThumb: byId("progressThumb"), progressBar: byId("progressBar"),
    currentTime: byId("currentTime"), totalTime: byId("totalTime"),
    volumeSlider: byId("volumeSlider"), discAnim: byId("discAnim"),
    lyricList: byId("lyricList")
  };

  var currentSong = null;
  var playerPlaylist = [];
  var currentIndex = -1;
  var isPlaying = false;
  var lyrics = [];

  function parseLrc(text) {
    if (!text) return [];
    var lines = [];
    var regex = /^\[(\d{2}):(\d{2})[\.:](\d{2,3})\](.*)/;
    text.split("\n").forEach(function(line) {
      var m = line.match(regex);
      if (m) {
        var t = parseInt(m[1]) * 60 + parseInt(m[2]) + parseInt(m[3].padEnd(3, "0")) / 1000;
        var txt = m[4].trim();
        if (txt) lines.push({ time: t, text: txt });
      }
    });
    lines.sort(function(a, b) { return a.time - b.time; });
    return lines;
  }

  function renderLyrics(arr) {
    lyrics = arr || [];
    dom.lyricList.innerHTML = "";
    if (!lyrics.length) {
      dom.lyricList.innerHTML = "<div style=\"color:#999;font-size:14px;text-align:center\">閺嗗倹妫ゅ宀冪槤</div>";
      return;
    }
    lyrics.forEach(function(l) {
      var d = document.createElement("div");
      d.className = "lyric-line";
      d.textContent = l.text;
      dom.lyricList.appendChild(d);
    });
  }

  function syncLyric(t) {
    if (!lyrics.length) return;
    var ai = -1;
    for (var i = lyrics.length - 1; i >= 0; i--) {
      if (t >= lyrics[i].time) { ai = i; break; }
    }
    var els = dom.lyricList.querySelectorAll(".lyric-line");
    els.forEach(function(el, idx) { el.classList.toggle("active", idx === ai); });
    if (ai >= 0 && els[ai]) els[ai].scrollIntoView({ block: "center", behavior: "smooth" });
  }

  function fmt(t) {
    if (!t || isNaN(t)) return "00:00";
    var m = Math.floor(t / 60);
    var s = Math.floor(t % 60);
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
  }

  function updateUI() {
    if (!currentSong) return;
    var s = currentSong;
    var cover = s.cover || "data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 60 60%27%3E%3Crect fill=%27%23ddd%27 width=%2760%27 height=%2760%27/%3E%3Ctext x=%2730%27 y=%2735%27 text-anchor=%27middle%27 fill=%27%23999%27 font-size=%2724%27%3E\u266B%3C/text%3E%3C/svg%3E";
    dom.miniCover.src = cover;
    dom.miniTitle.textContent = s.name;
    dom.miniArtist.textContent = s.artist;
    dom.playerCover.src = cover;
    dom.playerTitle.textContent = s.name;
    dom.playerArtist.textContent = s.artist;
    document.title = s.name + " - FMusic";
  }

  function updateBtn() {
    var icon = isPlaying ? "\u23F8" : "\u25B6";
    dom.playBtn.textContent = icon;
    dom.miniPlayBtn.textContent = icon;
    dom.discAnim.classList.toggle("playing", isPlaying);
  }

  function onProgress() {
    var cur = audio.currentTime || 0;
    var tot = audio.duration || 0;
    var pct = tot > 0 ? (cur / tot) * 100 : 0;
    dom.progressFill.style.width = pct + "%";
    dom.progressThumb.style.left = pct + "%";
    dom.currentTime.textContent = fmt(cur);
    dom.totalTime.textContent = fmt(tot);
    syncLyric(cur);
  }

  function playLocal(song, playlist, index) {
    if (!song) return;
    currentSong = song;
    if (playlist) playerPlaylist = playlist;
    if (index !== undefined) currentIndex = index;
    updateUI();

    audio.src = encodeURI(song.file);
    audio.play().then(function() {
      isPlaying = true;
      updateBtn();
    }).catch(function(e) {
      showToast("\u26A0\uFE0F \u64AD\u653E\u5931\u8D25");
      isPlaying = false;
      updateBtn();
    });

    if (song.lrc) {
      fetch(encodeURI(song.lrc)).then(function(r) {
        if (!r.ok) throw Error();
        return r.text();
      }).then(function(t) { renderLyrics(parseLrc(t)); }).catch(function() { renderLyrics([]); });
    } else {
      renderLyrics([]);
    }
  }

  function togglePlay(e) {
    if (e) e.stopPropagation();
    if (!currentSong) { showToast("\u8BF7\u5148\u9009\u62E9\u4E00\u9996\u6B4C\u66F2"); return; }
    if (audio.src) {
      if (isPlaying) { audio.pause(); isPlaying = false; }
      else { audio.play().catch(function(){}); isPlaying = true; }
      updateBtn();
    }
  }

  function prev() {
    if (!playerPlaylist.length) return;
    currentIndex = (currentIndex - 1 + playerPlaylist.length) % playerPlaylist.length;
    playLocal(playerPlaylist[currentIndex], playerPlaylist, currentIndex);
  }

  function next() {
    if (!playerPlaylist.length) return;
    currentIndex = (currentIndex + 1) % playerPlaylist.length;
    playLocal(playerPlaylist[currentIndex], playerPlaylist, currentIndex);
  }

  function seek(e) {
    var r = dom.progressBar.getBoundingClientRect();
    var pct = (e.clientX - r.left) / r.width;
    if (audio.duration) audio.currentTime = pct * audio.duration;
  }

  function setVolume(v) { audio.volume = parseFloat(v); }

  function showToast(msg) {
    var t = byId("errorToast");
    if (!t) return;
    t.textContent = msg;
    t.style.display = "block";
    setTimeout(function() { t.style.display = "none"; }, 3500);
  }

  audio.addEventListener("timeupdate", onProgress);
  audio.addEventListener("ended", next);
  audio.addEventListener("loadedmetadata", function() { dom.totalTime.textContent = fmt(audio.duration); });

  document.addEventListener("keydown", function(e) {
    if (e.target.tagName === "INPUT") return;
    if (e.code === "Space") { e.preventDefault(); togglePlay(); }
    if (e.code === "ArrowLeft") { audio.currentTime = Math.max(0, audio.currentTime - 5); }
    if (e.code === "ArrowRight") { audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 5); }
  });

  return {
    playLocal: playLocal, togglePlay: togglePlay,
    prev: prev, next: next, seek: seek, setVolume: setVolume,
    getCurrentSong: function() { return currentSong; }
  };
})();
