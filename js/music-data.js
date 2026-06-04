// ===== music-data.js - 本地音乐清单（自动生成）=====
// 重新生成请运行: node scan-music.js

const LOCAL_MUSIC = [
  {
    id: '周杰伦_01',
    name: '那天下雨了',
    artist: '周杰伦',
    file: 'singer/周杰伦/那天下雨了-周杰伦.mp3',
    lrc: 'singer/周杰伦/那天下雨了-周杰伦-歌词.lrc'
  },
  {
    id: '李荣浩_02',
    name: '恋人',
    artist: '李荣浩',
    file: 'singer/李荣浩/李荣浩 - 恋人.mp3'
  },
  {
    id: '郑润泽_03',
    name: '如果呢',
    artist: '郑润泽',
    file: 'singer/郑润泽/郑润泽 - 如果呢.mp3'
  }
];

// ===== 自动生成歌手分组 ===== 
const SINGER_MAP = {};
LOCAL_MUSIC.forEach(function(song) {
  var artist = song.artist;
  if (!SINGER_MAP[artist]) {
    SINGER_MAP[artist] = {
      name: artist,
      songs: [],
      cover: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(artist) + '&size=300&background=C20C0C&color=fff&bold=true&length=1&font-size=0.40'
    };
  }
  SINGER_MAP[artist].songs.push(song);
});
var SINGER_LIST = [];
for (var key in SINGER_MAP) { SINGER_LIST.push(SINGER_MAP[key]); }
