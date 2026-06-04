// ===== scan-music.js - 自动扫描歌手文件夹生成 music-data.js =====
// 使用方法：node scan-music.js
// 会自动扫描 singer/ 下所有 MP3 文件，更新 music-data.js

const fs = require("fs");
const path = require("path");

const singerDir = path.join(__dirname, "singer");
const outputFile = path.join(__dirname, "js", "music-data.js");

// 扫描所有歌手文件夹
const singers = fs.readdirSync(singerDir, { withFileTypes: true })
  .filter(function(d) { return d.isDirectory(); })
  .map(function(d) { return d.name; });

var songs = [];
var idCounter = 1;

singers.forEach(function(singerName) {
  var singerPath = path.join(singerDir, singerName);
  var files = fs.readdirSync(singerPath);

  files.forEach(function(file) {
    if (!file.endsWith(".mp3")) return;

    // 解析歌名和歌手
    var nameWithoutExt = file.slice(0, -4);
    var songName = nameWithoutExt;
    var artist = singerName;

    // 如果文件名包含 " - "（歌手 - 歌名格式）
    var dashIdx = nameWithoutExt.indexOf(" - ");
    if (dashIdx > 0) {
      var before = nameWithoutExt.slice(0, dashIdx).trim();
      var after = nameWithoutExt.slice(dashIdx + 3).trim();
      // 如果前半部分和歌手文件夹同名，则后半部分是歌名
      if (before === singerName) {
        artist = before;
        songName = after;
      } else {
        songName = nameWithoutExt;
      }
    }
    // 如果文件名包含 "-"（歌名-歌手格式）
    dashIdx = nameWithoutExt.indexOf("-");
    if (dashIdx > 0 && songName === nameWithoutExt) {
      var before = nameWithoutExt.slice(0, dashIdx).trim();
      var after = nameWithoutExt.slice(dashIdx + 1).trim();
      if (after === singerName) {
        songName = before;
      }
    }

    // 查找同名的 LRC 歌词文件
    var lrcFile = null;
    var lrcCandidate = path.join(singerPath, nameWithoutExt + "-歌词.lrc");
    if (fs.existsSync(lrcCandidate)) lrcFile = lrcCandidate;

    var id = (singerName + "_" + String(idCounter).padStart(2, "0"));
    idCounter++;

    var relativePath = "singer/" + singerName + "/" + file;
    var relativeLrc = lrcFile ? "singer/" + singerName + "/" + path.basename(lrcFile) : null;

    songs.push({
      id: id,
      name: songName,
      artist: artist,
      file: relativePath,
      lrc: relativeLrc
    });
  });
});

// 生成 music-data.js
var lines = [];
lines.push("// ===== music-data.js - 本地音乐清单（自动生成）=====");
lines.push("// 重新生成请运行: node scan-music.js");
lines.push("");
lines.push("const LOCAL_MUSIC = [");

songs.forEach(function(s, idx) {
  var comma = (idx < songs.length - 1) ? "," : "";
  var lrcLine = s.lrc ? ",\n    lrc: '" + s.lrc.replace(/\\/g, "/") + "'" : "";
  lines.push("  {");
  lines.push("    id: '" + s.id + "',");
  lines.push("    name: '" + s.name + "',");
  lines.push("    artist: '" + s.artist + "',");
  lines.push("    file: '" + s.file.replace(/\\/g, "/") + "'" + lrcLine);
  lines.push("  }" + comma);
});

lines.push("];");
lines.push("");
lines.push("// ===== 自动生成歌手分组 ===== ");
lines.push("const SINGER_MAP = {};");
lines.push("LOCAL_MUSIC.forEach(function(song) {");
lines.push("  var artist = song.artist;");
lines.push("  if (!SINGER_MAP[artist]) {");
lines.push("    SINGER_MAP[artist] = {");
lines.push("      name: artist,");
lines.push("      songs: [],");
lines.push("      cover: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist) + '&size=300&background=C20C0C&color=fff&bold=true&length=1&font-size=0.40'");
lines.push("    };");
lines.push("  }");
lines.push("  SINGER_MAP[artist].songs.push(song);");
lines.push("});");
lines.push("var SINGER_LIST = [];");
lines.push("for (var key in SINGER_MAP) { SINGER_LIST.push(SINGER_MAP[key]); }");
lines.push("");

fs.writeFileSync(outputFile, lines.join("\n"), "utf8");
console.log("✅ 已更新 music-data.js，共 " + songs.length + " 首歌曲");
console.log("📁 歌手: " + singers.join(", "));
songs.forEach(function(s) {
  console.log("   🎵 " + s.artist + " - " + s.name + (s.lrc ? " (有歌词)" : ""));
});
