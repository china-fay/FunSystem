// ===== books.js - 书籍模块（书架UI）=====

const booksModule = (function() {
  'use strict';

  // ========== 书籍数据 ==========
  const BOOKS = [
    {
      id: 'book_01', title: '活着', author: '余华',
      desc: '讲述了农村人福贵悲惨的人生遭遇。福贵本是个阔少爷，可他嗜赌如命，终于赌光了家业，一贫如洗。他的父亲被他活活气死，母亲则在穷困中患了重病...',
      year: '1993', category: '文学经典',
      spineColor: '#8B4513', spineHeight: 180, spineWidth: 28
    },
    {
      id: 'book_02', title: '百年孤独', author: '加西亚·马尔克斯',
      desc: '魔幻现实主义文学的代表作，描写了布恩迪亚家族七代人的传奇故事，以及加勒比海沿岸小镇马孔多的百年兴衰。',
      year: '1967', category: '外国文学',
      spineColor: '#2E4057', spineHeight: 195, spineWidth: 32
    },
    {
      id: 'book_03', title: '三体', author: '刘慈欣',
      desc: '讲述了地球人类文明和三体文明的信息交流、生死搏杀及两个文明在宇宙中的兴衰历程。第一部经过汪淼介入，最终联系到了在寻找地球的三体文明。',
      year: '2008', category: '科幻奇幻',
      spineColor: '#1A237E', spineHeight: 190, spineWidth: 30
    },
    {
      id: 'book_04', title: '红楼梦', author: '曹雪芹',
      desc: '中国古代四大名著之一，以贾宝玉、林黛玉、薛宝钗的爱情婚姻悲剧为主线，描绘了一个封建大家族的兴衰历程。',
      year: '1791', category: '文学经典',
      spineColor: '#6B1D2A', spineHeight: 210, spineWidth: 35
    },
    {
      id: 'book_05', title: '围城', author: '钱钟书',
      desc: '以幽默讽刺的笔调描写了抗战初期知识分子的群相，被誉为"新儒林外史"。主人公方鸿渐的婚姻与事业困境令人深思。',
      year: '1947', category: '文学经典',
      spineColor: '#4A6741', spineHeight: 175, spineWidth: 26
    },
    {
      id: 'book_06', title: '平凡的世界', author: '路遥',
      desc: '以中国70年代到80年代中期为背景，以孙少安和孙少平两兄弟为中心，刻画了社会各阶层众多普通人的形象。',
      year: '1986', category: '文学经典',
      spineColor: '#5D4037', spineHeight: 200, spineWidth: 34
    },
    {
      id: 'book_07', title: '挪威的森林', author: '村上春树',
      desc: '故事讲述主角纠缠在情绪不稳定且患有精神疾病的直子和开朗活泼的小林绿子之间，展开了自我成长的旅程。',
      year: '1987', category: '外国文学',
      spineColor: '#2C6B4F', spineHeight: 185, spineWidth: 28
    },
    {
      id: 'book_08', title: '小王子', author: '圣埃克苏佩里',
      desc: '以一位飞行员作为故事叙述者，讲述了小王子从自己星球出发前往地球的过程中，所经历的各种历险。',
      year: '1943', category: '外国文学',
      spineColor: '#4A7C8C', spineHeight: 165, spineWidth: 22
    },
    {
      id: 'book_09', title: '1984', author: '乔治·奥威尔',
      desc: '小说刻画了在极权主义社会中，真理被抹杀、思想被控制的人类生存状态，被誉为反乌托邦文学的经典之作。',
      year: '1949', category: '外国文学',
      spineColor: '#3E2723', spineHeight: 188, spineWidth: 30
    },
    {
      id: 'book_10', title: '哈利·波特与魔法石', author: 'J.K.罗琳',
      desc: '一岁的哈利·波特失去父母后，在姨父家过着饱受欺凌的生活。直到十一岁生日那天，他发现自己原来是个巫师...',
      year: '1997', category: '科幻奇幻',
      spineColor: '#7B1FA2', spineHeight: 195, spineWidth: 32
    },
    {
      id: 'book_11', title: '白鹿原', author: '陈忠实',
      desc: '以陕西关中平原上的白鹿村为背景，讲述了白姓和鹿姓两大家族祖孙三代的恩怨纷争，展现了中国农村的历史变迁。',
      year: '1993', category: '文学经典',
      spineColor: '#8D6E63', spineHeight: 205, spineWidth: 36
    },
    {
      id: 'book_12', title: '银河帝国', author: '艾萨克·阿西莫夫',
      desc: '在银河帝国建立一万两千年后，哈里·谢顿预见到帝国即将灭亡，于是他创建了"基地"来保存知识，缩短黑暗时代。',
      year: '1951', category: '科幻奇幻',
      spineColor: '#283593', spineHeight: 192, spineWidth: 30
    }
  ];

  // 分类
  const CATEGORIES = ['文学经典', '外国文学', '科幻奇幻'];

  // 书脊颜色调色板（备用）
  const COLORS = ['#8B4513','#2E4057','#1A237E','#6B1D2A','#4A6741','#5D4037','#2C6B4F','#4A7C8C','#3E2723','#7B1FA2','#8D6E63','#283593'];

  function escapeHtml(str) {
    if (!str) return '';
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ========== 渲染书架 ==========
  function renderBookshelf(container) {
    if (!container) container = document.getElementById('moduleBooks');

    var html = '<div class="books-header">' +
      '<h2>📚 书架</h2>' +
      '<span class="section-sub">共 ' + BOOKS.length + ' 本书</span>' +
      '</div>';

    // 分类标签
    html += '<div class="books-tabs">';
    html += '<button class="books-tab active" data-cat="all">全部</button>';
    CATEGORIES.forEach(function(cat) {
      html += '<button class="books-tab" data-cat="' + escapeHtml(cat) + '">' + escapeHtml(cat) + '</button>';
    });
    html += '</div>';

    // 书架区域
    html += '<div class="bookshelf-area" id="bookshelfArea">';
    html += renderShelves('all');
    html += '</div>';

    container.innerHTML = html;

    // 绑定分类标签事件
    container.querySelectorAll('.books-tab').forEach(function(tab) {
      tab.addEventListener('click', function() {
        container.querySelectorAll('.books-tab').forEach(function(t) { t.classList.remove('active'); });
        tab.classList.add('active');
        var cat = tab.dataset.cat;
        document.getElementById('bookshelfArea').innerHTML = renderShelves(cat);
        bindBookClicks();
      });
    });

    bindBookClicks();
  }

  // ========== 渲染书架（按分类筛选） ==========
  function renderShelves(category) {
    var filtered = (category === 'all') ? BOOKS : BOOKS.filter(function(b) { return b.category === category; });
    if (filtered.length === 0) {
      return '<div style="text-align:center;padding:60px 20px;color:#999">该分类暂无书籍</div>';
    }

    // 把书分成几排（每排最多 6 本）
    var rows = [];
    var perRow = 6;
    for (var i = 0; i < filtered.length; i += perRow) {
      rows.push(filtered.slice(i, i + perRow));
    }

    var html = '';
    rows.forEach(function(row, ri) {
      html += '<div class="shelf-row">';
      // 书架背板
      html += '<div class="shelf-back"></div>';
      // 书籍
      html += '<div class="shelf-books">';
      row.forEach(function(book) {
        var h = book.spineHeight;
        var w = book.spineWidth;
        // 垂直排列书名
        var titleChars = book.title.split('').map(function(c) {
          return '<span class="spine-char">' + escapeHtml(c) + '</span>';
        }).join('');
        html += '<div class="book-spine" data-id="' + book.id + '" style="height:' + h + 'px;width:' + w + 'px;background:' + book.spineColor + '">' +
          '<div class="spine-title">' + titleChars + '</div>' +
          '<div class="spine-author" style="font-size:' + Math.max(8, Math.min(10, w/3)) + 'px">' + escapeHtml(book.author) + '</div>' +
          '</div>';
      });
      html += '</div>';
      // 书架板
      html += '<div class="shelf-board"></div>';
      html += '</div>';
    });

    return html;
  }

  // ========== 绑定书籍点击事件 ==========
  function bindBookClicks() {
    document.querySelectorAll('#moduleBooks .book-spine').forEach(function(el) {
      el.addEventListener('click', function() {
        var id = el.dataset.id;
        var book = null;
        for (var i = 0; i < BOOKS.length; i++) {
          if (BOOKS[i].id === id) { book = BOOKS[i]; break; }
        }
        if (book) showBookDetail(book);
      });
    });
  }

  // ========== 显示书籍详情弹窗 ==========
  function showBookDetail(book) {
    var overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.display = 'flex';
    overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

    overlay.innerHTML = '<div class="modal-box book-detail-modal">' +
      '<div class="book-detail-header" style="background:' + book.spineColor + '">' +
      '  <span class="book-detail-icon">📖</span>' +
      '  <h3>' + escapeHtml(book.title) + '</h3>' +
      '</div>' +
      '<div class="book-detail-body">' +
      '  <div class="book-detail-meta">' +
      '    <div class="book-detail-author">作者：' + escapeHtml(book.author) + '</div>' +
      '    <div class="book-detail-year">出版年份：' + escapeHtml(book.year) + '</div>' +
      '    <div class="book-detail-cat">分类：' + escapeHtml(book.category) + '</div>' +
      '  </div>' +
      '  <div class="book-detail-desc">' +
      '    <p>' + escapeHtml(book.desc) + '</p>' +
      '  </div>' +
      '</div>' +
      '<div class="modal-actions">' +
      '  <button class="btn-primary" onclick="this.closest(\'.modal-overlay\').remove()">关闭</button>' +
      '</div>' +
      '</div>';

    document.body.appendChild(overlay);
  }

  return {
    render: renderBookshelf,
    getBooks: function() { return BOOKS; }
  };
})();
