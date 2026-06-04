// ===== app.js - 本地音乐播放器主逻辑 =====

const app = (function() {
  'use strict';

  // 当前浏览的歌手
  var currentSinger = null;
  // 搜索结果显示的歌曲列表
  var searchResults = null;

  // ========== 渲染歌手列表（首页） ==========
  function renderSingers() {
    var container = document.getElementById('mainContent');
    currentSinger = null;
    searchResults = null;

    var html = '<div class="section-header">' +
      '<h2>🎤 所有歌手</h2>' +
      '<span class="section-sub">共 ' + SINGER_LIST.length + ' 位</span>' +
      '</div>' +
      '<div class="singer-grid" id="singerGrid">';

    SINGER_LIST.forEach(function(singer, index) {
      var songCount = singer.songs.length;
      html += '<div class="singer-card" data-index="' + index + '">' +
        '<img class="singer-avatar" src="' + singer.cover + '" alt="' + singer.name + '" loading="lazy"' +
        '  onerror="this.src=\'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27%3E%3Crect fill=%27%23C20C0C%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%27 y=%2760%27 text-anchor=%27middle%27 fill=%27%23fff%27 font-size=%2724%27%3E♪%3C/text%3E%3C/svg%3E\'">' +
        '<div class="singer-info">' +
        '  <div class="singer-name">' + escapeHtml(singer.name) + '</div>' +
        '  <div class="singer-count">' + songCount + ' 首歌曲</div>' +
        '</div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    // 绑定点击事件
    document.querySelectorAll('.singer-card').forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.dataset.index);
        showSinger(idx);
      });
    });

    // 隐藏搜索结果
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('categoryNav').style.display = 'none';
  }

  // ========== 显示歌手的歌曲列表 ==========
  function showSinger(index) {
    var singer = SINGER_LIST[index];
    currentSinger = singer;

    var container = document.getElementById('mainContent');
    var html = '<div class="section-header">' +
      '<button class="back-btn" onclick="app.renderSingers()">← 返回</button>' +
      '<h2>' + escapeHtml(singer.name) + '</h2>' +
      '<span class="section-sub">' + singer.songs.length + ' 首歌曲</span>' +
      '</div>' +
      '<div class="song-list">';

    singer.songs.forEach(function(song, idx) {
      html += '<div class="song-item" data-idx="' + idx + '">' +
        '<div class="song-play-icon">▶</div>' +
        '<div class="song-info">' +
        '  <div class="song-name">' + escapeHtml(song.name) + '</div>' +
        '  <div class="song-artist">' + escapeHtml(song.artist) + '</div>' +
        '</div>' +
        '<div class="song-duration" id="dur-' + song.id + '"></div>' +
        '</div>';
    });

    html += '</div>';
    container.innerHTML = html;

    // 绑定点击事件
    document.querySelectorAll('.song-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.dataset.idx);
        var song = singer.songs[idx];
        player.playLocal(song, singer.songs, idx);
      });
    });

    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('homeSection').style.display = 'block';
  }

  // ========== 搜索本地歌曲 ==========
  function searchLocal() {
    var input = document.getElementById('searchInput');
    var keyword = input.value.trim().toLowerCase();
    if (!keyword) {
      renderSingers();
      return;
    }

    var results = [];
    LOCAL_MUSIC.forEach(function(song) {
      if (song.name.toLowerCase().indexOf(keyword) !== -1 ||
        song.artist.toLowerCase().indexOf(keyword) !== -1) {
        results.push(song);
      }
    });

    var searchSection = document.getElementById('searchSection');
    var searchResultsEl = document.getElementById('searchResults');
    var countEl = document.getElementById('searchResultCount');

    searchResults = results;
    currentSinger = null;
    document.getElementById('homeSection').style.display = 'block';
    document.getElementById('mainContent').innerHTML = '';
    searchSection.style.display = 'block';
    document.getElementById('categoryNav').style.display = 'none';

    if (results.length === 0) {
      searchResultsEl.innerHTML = '<div style="text-align:center;padding:40px;color:#999">未找到相关歌曲</div>';
      countEl.textContent = '未找到';
      return;
    }

    countEl.textContent = '找到 ' + results.length + ' 首';
    var html = '';
    results.forEach(function(song, idx) {
      html += '<div class="song-item search-result-item" data-idx="' + idx + '">' +
        '<div class="song-play-icon">▶</div>' +
        '<div class="song-info">' +
        '  <div class="song-name">' + escapeHtml(song.name) + '</div>' +
        '  <div class="song-artist">' + escapeHtml(song.artist) + '</div>' +
        '</div>' +
        '</div>';
    });
    searchResultsEl.innerHTML = html;

    document.querySelectorAll('#searchResults .song-item').forEach(function(el) {
      el.addEventListener('click', function() {
        var idx = parseInt(el.dataset.idx);
        var song = results[idx];
        player.playLocal(song, results, idx);
      });
    });
  }

  // ========== 歌词面板 ==========
  function toggleLyricPanel() {
    document.getElementById('lyricPanel').classList.toggle('open');
  }

  function expandPlayer() {
    document.getElementById('playerBar').classList.add('expanded');
  }

  function downloadSong() {
    var song = player.getCurrentSong();
    if (!song) { showToast('请先播放一首歌曲'); return; }
    document.getElementById('downloadModal').style.display = 'flex';
  }

  window.closeDownloadModal = function(e) {
    if (e && e.target !== document.getElementById('downloadModal')) return;
    document.getElementById('downloadModal').style.display = 'none';
  };

  window.confirmDownload = async function() {
    document.getElementById('downloadModal').style.display = 'none';
    var song = player.getCurrentSong();
    if (!song) return;

    if (!song.file) {
      showToast('⚠️ 无法下载该歌曲');
      return;
    }

    try {
      var response = await fetch(song.file);
      if (!response.ok) throw new Error('下载失败');
      var blob = await response.blob();
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = song.name + ' - ' + song.artist + '.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('✅ 下载完成！请遵守版权，仅限个人学习使用');
    } catch (e) {
      showToast('⚠️ 下载失败');
    }
  };

  // ========== 工具函数 ==========
  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showToast(msg) {
    var toast = document.getElementById('errorToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = 'block';
    setTimeout(function() { toast.style.display = 'none'; }, 3500);
  }


  // ========== 模块切换 ==========
  var currentModule = 'music';

  function switchModule(name) {
    if (name === currentModule) return;

    document.querySelectorAll('#sidebar .sidebar-item').forEach(function(el) {
      el.classList.toggle('active', el.dataset.module === name);
    });

    document.querySelectorAll('.module-panel').forEach(function(el) {
      el.classList.toggle('active', el.id === 'module' + name.charAt(0).toUpperCase() + name.slice(1));
    });

    var searchWrap = document.getElementById('searchBoxWrap');
    if (searchWrap) {
      searchWrap.style.display = (name === 'music') ? 'flex' : 'none';
    }

    currentModule = name;

    if (name !== 'music') {
      document.getElementById('lyricPanel').classList.remove('open');
    }
  }
  // ========== 初始化 ==========
  function init() {
    renderSingers();
    // 搜索框回车
    document.getElementById('searchInput').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') searchLocal();
    });
    console.log('[App] FMusic 本地版已启动，共 ' + LOCAL_MUSIC.length + ' 首本地歌曲');

    // 初始化书架模块
    booksModule.render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    renderSingers: renderSingers,
    searchLocal: searchLocal,
    toggleLyricPanel: toggleLyricPanel,
    expandPlayer: expandPlayer,
    downloadSong: downloadSong,
    switchModule: switchModule
  };
})();
