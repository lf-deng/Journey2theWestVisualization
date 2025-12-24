/**
 * 读者评价人物分析可视化
 */

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'sentiment') {
            initSentimentCharts();
        }
    });

    if (document.getElementById('sentiment').classList.contains('active')) {
        setTimeout(initSentimentCharts, 100);
    }
});

async function initSentimentCharts() {
    // 人物评价关键词
    initSentimentKeywords();

    // 评论类型分布
    initReviewTypePie();
}

function initSentimentKeywords() {
    const containerId = 'sentiment-keywords-chart';
    const chart = window.chartManager.initChart(containerId);
  
    // ===== 1) 用“西游记人物书评”风格关键词替换原词 =====
    // 来自书评/评论中高频人物评价与人物要素：机智、反叛、忠心耿耿、武艺高强、迂腐懦弱、贪吃懒惰、好逸恶劳、拖延等
//     1. 每个人物固定一种颜色
//     - 孙悟空：朱砂红 #D23C3C
//     - 唐僧：金色 #FFD700
//     - 猪八戒：棕色 #CD853F
//     - 沙僧：云水蓝 #2C7BE5
//     - 主题：紫檀 #8B4C8B
    const keywordsData = [
      // 孙悟空相关
      { name: '机智', value: 220 },
      { name: '反叛', value: 185 },
      { name: '勇敢', value: 200 },
      { name: '武艺高强', value: 175 },
      { name: '忠心耿耿', value: 165 },
      { name: '桀骜不驯', value: 150 },
      { name: '七十二变', value: 145 },
      { name: '大闹天宫', value: 140 },
  
      // 唐僧相关
      { name: '慈悲为怀', value: 170 },
      { name: '信仰坚定', value: 160 },
      { name: '精神领袖', value: 150 },
      { name: '迂腐', value: 155 },
      { name: '懦弱', value: 120 },
      { name: '易受骗', value: 115 },
  
      // 猪八戒相关
      { name: '贪吃', value: 165 },
      { name: '懒惰', value: 150 },
      { name: '好逸恶劳', value: 135 },
      { name: '拖延', value: 120 },
      { name: '人间烟火气', value: 140 },
      { name: '可笑又可怜', value: 110 },
  
      // 沙僧/团队气质
      { name: '沉稳', value: 125 },
      { name: '任劳任怨', value: 135 },
      { name: '可靠', value: 128 },
  
      // 西游“神魔气”
      { name: '妖魔鬼怪', value: 150 },
      { name: '取经', value: 165 },
      { name: '修行', value: 145 },
      { name: '劫难', value: 130 },
      { name: '讽刺', value: 125 },
      { name: '天庭', value: 115 },
      { name: '佛门', value: 110 }
    ].sort((a, b) => b.value - a.value);
  
    // ===== 2) 根据人物分配颜色 =====
    // 定义每个人物的关键词
    const characterKeywords = {
      'sunwukong': ['机智', '反叛', '勇敢', '武艺高强', '忠心耿耿', '桀骜不驯', '七十二变', '大闹天宫'],
      'tangseng': ['慈悲为怀', '信仰坚定', '精神领袖', '迂腐', '懦弱', '易受骗'],
      'zhubajie': ['贪吃', '懒惰', '好逸恶劳', '拖延', '人间烟火气', '可笑又可怜'],
      'shaseng': ['沉稳', '任劳任怨', '可靠'],
      'theme': ['妖魔鬼怪', '取经', '修行', '劫难', '讽刺', '天庭', '佛门']
    };
  
    // 为每个人物分配一个固定颜色
    const characterColors = {
      'sunwukong': '#D23C3C',  // 孙悟空：朱砂红（火眼金睛、大闹天宫）
      'tangseng': '#FFD700',   // 唐僧：金色（佛光、慈悲）
      'zhubajie': '#CD853F',   // 猪八戒：棕色（人间烟火）
      'shaseng': '#2C7BE5',    // 沙僧：云水蓝（沉稳可靠）
      'theme': '#8B4C8B'       // 主题：紫檀（神魔神秘）
    };
  
    // 根据词名找到对应的人物
    function getCharacterForWord(word) {
      for (const [character, keywords] of Object.entries(characterKeywords)) {
        if (keywords.includes(word)) {
          return character;
        }
      }
      return 'theme'; // 默认归类为主题
    }
  
    // 根据人物返回固定颜色
    function pickColorByCharacter(word) {
      const character = getCharacterForWord(word);
      return characterColors[character];
    }
  
    // ===== 3) 背景做成“宣纸/绘卷”质感 + 祥云光晕 =====
    const option = {
      backgroundColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#FBF6EA' },  // 宣纸浅黄
        { offset: 1, color: '#F4EFE2' }
      ]),
      tooltip: {
        trigger: 'item',
        formatter: (p) => `${p.name}：${p.value}次`,
        backgroundColor: 'rgba(17, 24, 39, 0.92)',
        borderWidth: 0,
        padding: [10, 12],
        textStyle: { color: '#fff', fontSize: 12 }
      },
      graphic: [
        // 左上"祥云光晕" - 更柔和
        {
          type: 'circle',
          left: '8%',
          top: '15%',
          shape: { r: 100 },
          style: {
            fill: 'rgba(110, 168, 255, 0.08)',
            shadowBlur: 60,
            shadowColor: 'rgba(110, 168, 255, 0.15)'
          },
          silent: true
        },
        // 右下"鎏金光晕" - 更柔和
        {
          type: 'circle',
          right: '10%',
          bottom: '10%',
          shape: { r: 120 },
          style: {
            fill: 'rgba(200, 162, 74, 0.08)',
            shadowBlur: 70,
            shadowColor: 'rgba(200, 162, 74, 0.15)'
          },
          silent: true
        },
        // 中间添加一个微妙的中心光晕
        {
          type: 'circle',
          left: 'center',
          top: 'center',
          shape: { r: 80 },
          style: {
            fill: 'rgba(255, 255, 255, 0.05)',
            shadowBlur: 50,
            shadowColor: 'rgba(255, 255, 255, 0.1)'
          },
          silent: true
        }
      ],
      series: [{
        type: 'wordCloud',
        // 使用圆形布局，更稳定
        shape: 'circle',
        left: 'center',
        top: 'center',
        width: '90%',
        height: '90%',
        // 调整字号范围，让重要词更突出
        sizeRange: [22, 70],
        // 减少旋转角度，让布局更整齐
        rotationRange: [-20, 20],
        rotationStep: 20,
        // 增大网格间距，让词更分散，布局更舒适
        gridSize: 24,
        // 不允许词超出边界，保持布局整洁
        drawOutOfBound: false,
        layoutAnimation: true,
  
        textStyle: {
          fontFamily: 'STHeiti, Songti SC, SimSun, Microsoft YaHei, PingFang SC, Noto Sans CJK SC, Arial',
          fontWeight: 700,
          // 增强阴影效果，让字更立体
          shadowBlur: 14,
          shadowColor: 'rgba(0, 0, 0, 0.22)',
          shadowOffsetX: 2,
          shadowOffsetY: 4
        },
        emphasis: {
          focus: 'self',
          textStyle: {
            // hover 时增强效果
            shadowBlur: 32,
            shadowColor: 'rgba(0, 0, 0, 0.4)',
            fontWeight: 900
          }
        },
        // 为每个词单独设置颜色，根据人物分配
        data: keywordsData.map(d => ({
          name: d.name,
          value: d.value,
          textStyle: {
            color: pickColorByCharacter(d.name)
          }
        }))
      }]
    };
  
    try {
      chart.setOption(option, true);
    } catch (error) {
      console.warn('WordCloud extension unavailable, fallback to bubble chart.', error);
      chart.setOption(createSentimentBubbleFallback(keywordsData));
    }
  }
  
function createSentimentBubbleFallback(data) {
    return {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次'
        },
        series: [{
            type: 'scatter',
            symbolSize: function (val) {
                return Math.sqrt(val[2]) * 5;
            },
            data: data.map((d, i) => [
                (i % 5) * 200 + Math.random() * 100,
                Math.floor(i / 5) * 150 + Math.random() * 100,
                d.value,
                d.name
            ]),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                    { offset: 0, color: '#667eea' },
                    { offset: 0.5, color: '#f093fb' },
                    { offset: 1, color: '#43e97b' }
                ]),
                shadowBlur: 15,
                shadowColor: 'rgba(102, 126, 234, 0.3)'
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 25,
                    shadowColor: 'rgba(102, 126, 234, 0.6)'
                }
            },
            label: {
                formatter: '{@[3]}',
                show: false,
                position: 'inside',
                fontSize: 12,
                color: '#fff',
                fontWeight: 'bold'
            }
        }],
        xAxis: {
            type: 'value',
            splitNumber: 5,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
        },
        yAxis: {
            type: 'value',
            splitNumber: 4,
            boundaryGap: false,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { show: false },
            splitLine: { show: false }
        },
        grid: {
            left: '5%',
            right: '5%',
            top: '5%',
            bottom: '5%',
            containLabel: false
        }
    };
}

function initReviewTypePie() {
    const containerId = 'review-type-chart';
    const chart = window.chartManager.initChart(containerId);
  
    // 这里 value 先用示例占位；你后续用真实统计条数/占比替换即可
    const reviewTypeData = [
      { name: '情节复述型', value: 35 },
      { name: '价值判断型', value: 28 },
      { name: '文化比较型', value: 22 },
      { name: '情绪宣泄型', value: 15 }
    ];
  
    // 国风配色方案（符合西游记风格）
    const colors = [
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#D23C3C' },  // 朱砂红
        { offset: 1, color: '#FF7A7A' }
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#FFD700' },  // 金色
        { offset: 1, color: '#FFE08A' }
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#2C7BE5' },  // 云水蓝
        { offset: 1, color: '#6EA8FF' }
      ]),
      new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#8B4C8B' },  // 紫檀
        { offset: 1, color: '#C77DC7' }
      ])
    ];

    const option = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        formatter: '{b}<br/>{c}条评论（{d}%）',
        backgroundColor: 'rgba(20, 24, 40, 0.9)',
        borderWidth: 0,
        padding: [12, 16],
        textStyle: {
          color: '#fff',
          fontSize: 13,
          fontWeight: 500
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0,0,0,0.15); border-radius: 6px;'
      },
      legend: {
        orient: 'horizontal',
        left: 'center',
        bottom: '2%',
        itemGap: 50,  // 水平间距，确保一行两个
        itemWidth: 14,
        itemHeight: 6,  // 减小高度，让行间距更紧凑
        width: '70%',  // 限制宽度，让图例自动换行，每行约两个
        textStyle: {
          color: '#333',
          fontSize: 12,  // 稍微减小字体，让行间距更紧凑
          fontWeight: 500,
          padding: [0, 0, 0, 8],
          lineHeight: 12  // 设置行高，控制行间距
        },
        formatter: function(name) {
          const item = reviewTypeData.find(d => d.name === name);
          return `${name}  ${item ? item.value + '条' : ''}`;
        }
      },
      series: [{
        name: '评论类型',
        type: 'pie',
        radius: ['35%', '60%'],  // 缩小饼图，给图例留出更多空间
        center: ['50%', '38%'],  // 上移饼图，确保与图例不重叠
        avoidLabelOverlap: true,
        data: reviewTypeData.map((item, index) => ({
          ...item,
          itemStyle: {
            color: colors[index],
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 3,
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.1)'
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 20,
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowColor: 'rgba(0, 0, 0, 0.2)'
            },
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold'
            }
          }
        })),
        label: {
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          fontSize: 12,
          fontWeight: 500,
          color: '#333',
          lineHeight: 16,
          rich: {
            name: {
              fontSize: 12,
              color: '#666',
              lineHeight: 16
            },
            percent: {
              fontSize: 14,
              color: '#333',
              fontWeight: 'bold',
              lineHeight: 18
            }
          }
        },
        labelLine: {
          show: true,
          length: 15,
          length2: 10,
          lineStyle: {
            width: 2,
            type: 'solid',
            color: '#999'
          },
          smooth: 0.2
        },
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDelay: function (idx) {
          return idx * 100;
        }
      }]
    };
  
    chart.setOption(option, true);
  }
  

// function initSentimentDistribution() {
//     const containerId = 'sentiment-distribution-chart';
//     const chart = window.chartManager.initChart(containerId);

//     const sentimentData = [
//         { name: '正面评价', value: 62 },
//         { name: '中立评价', value: 24 },
//         { name: '负面评价', value: 14 }
//     ];

//     const option = {
//         tooltip: {
//             trigger: 'item',
//             formatter: '{b}: {c}%'
//         },
//         legend: {
//             orient: 'vertical',
//             left: 'left',
//             textStyle: { color: '#333' }
//         },
//         series: [{
//             name: '情感倾向',
//             type: 'pie',
//             radius: '70%',
//             data: sentimentData,
//             // 使用圆角让切片视觉更柔和
//             itemStyle: {
//                 borderRadius: 10,
//                 borderColor: '#fff',
//                 borderWidth: 2
//             },
//             label: {
//                 show: true,
//                 position: 'outside',
//                 formatter: '{b}: {d}%'
//             },
//             color: ['#43e97b', '#4facfe', '#fa709a']
//         }]
//     };

//     chart.setOption(option);
// }

// ========== 主要评价卡片筛选功能 ==========
(function () {
  const tagBar = document.getElementById('tagBar');
  const roles = Array.from(document.querySelectorAll('#roleGrid .role'));

  function setActive(btn){
    tagBar.querySelectorAll('.tag').forEach(t => t.classList.remove('is-active'));
    btn.classList.add('is-active');
  }

  function filterBy(tag){
    roles.forEach(r => {
      const tags = (r.getAttribute('data-tags') || '').split(/\s+/);
      const hit = tag === 'all' || tags.includes(tag);
      r.style.display = hit ? '' : 'none';
    });
  }

  if (tagBar) {
    tagBar.addEventListener('click', (e) => {
      const btn = e.target.closest('.tag');
      if (!btn) return;
      const tag = btn.dataset.tag;
      setActive(btn);
      filterBy(tag);
    });
  }
})();
