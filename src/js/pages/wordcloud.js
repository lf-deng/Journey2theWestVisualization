/**
 * 高频词汇分析可视化
 */

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'wordcloud') {
            initWordCloudCharts();
        }
    });

    if (document.getElementById('wordcloud').classList.contains('active')) {
        setTimeout(initWordCloudCharts, 100);
    }
});

async function initWordCloudCharts() {
    // 全书高频词
    initWordCloudAll();

    // 前期高频词
    initWordCloudEarly();

    // 后期高频词
    initWordCloudLate();

    // 孙悟空专属词
    initWordCloudSunwukong();

    // 唐僧专属词
    initWordCloudTangMonk();
}

function initWordCloudAll() {
    const containerId = 'wordcloud-all-chart';
    const chart = window.chartManager.initChart(containerId);

    const wordData = [
        { name: '孙悟空', value: 3961 },
        { name: '唐僧', value: 2312 },
        { name: '师父', value: 1788 },
        { name: '八戒', value: 1574 },
        { name: '妖怪', value: 1549 },
        { name: '行者', value: 1056 },
        { name: '和尚', value: 812 },
        { name: '菩萨', value: 757 },
        { name: '沙僧', value: 744 },
        { name: '大圣', value: 646 },
        { name: '没有', value: 637 },
        { name: '知道', value: 630 },
        { name: '国王', value: 609 },
        { name: '看见', value: 548 },
        { name: '妖精', value: 515 },
        { name: '出来', value: 514 },
        { name: '徒弟', value: 502 },
        { name: '来到', value: 478 },
        { name: '小妖', value: 434 },
        { name: '现在', value: 424 },
    ];

    const option = {
        series: [{
            type: 'wordCloud',
            shape: 'circle',
            left: 'center',
            top: 'center',
            width: '100%',
            height: '100%',
            right: null,
            bottom: null,
            sizeRange: [48, 144],
            rotationRange: [-45, 45],
            rotationStep: 45,
            gridSize: 8,
            drawOutOfBound: false,
            textPadding: 0,
            textStyle: {
                fontFamily: 'sans-serif',
                fontWeight: 'bold',
                color: function () {
                    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b'];
                    return colors[Math.floor(Math.random() * colors.length)];
                }
            },
            emphasis: {
                textStyle: {
                    textShadowBlur: 10,
                    textShadowColor: '#333'
                }
            },
            data: wordData
        }]
    };

    try {
        chart.setOption(option);
    } catch (error) {
        console.warn('WordCloud extension unavailable, fallback to bar chart.', error);
        chart.setOption(createBarChartOption('全书高频词', wordData.slice(0, 10)));
    }
}

function initWordCloudEarly() {
    const containerId = 'wordcloud-early-chart';
    const chart = window.chartManager.initChart(containerId);

    const wordData = [
        { name: '孙悟空', value: 926 },
        { name: '唐僧', value: 586 },
        { name: '师父', value: 448 },
        { name: '菩萨', value: 330 },
        { name: '八戒', value: 300 },
        { name: '妖怪', value: 294 },
        { name: '没有', value: 237 },
        { name: '和尚', value: 201 },
        { name: '大圣', value: 198 },
        { name: '看见', value: 151 },
        { name: '来到', value: 148 },
        { name: '袈裟', value: 134 },
        { name: '知道', value: 133 },
        { name: '出来', value: 126 },
        { name: '徒弟', value: 124 },
        { name: '行者', value: 121 },
        { name: '现在', value: 118 },
        { name: '悟空', value: 118 },
        { name: '沙僧', value: 108 },
        { name: '回来', value: 107 },
    ];

    const option = createBarChartOption('前期高频词（第1-30回）', wordData.slice(0, 19));
    chart.setOption(option);
}

function initWordCloudLate() {
    const containerId = 'wordcloud-late-chart';
    const chart = window.chartManager.initChart(containerId);

    const wordData = [
        { name: '孙悟空', value: 1195 },
        { name: '唐僧', value: 852 },
        { name: '师父', value: 587 },
        { name: '妖怪', value: 530 },
        { name: '八戒', value: 517 },
        { name: '行者', value: 303 },
        { name: '沙僧', value: 268 },
        { name: '和尚', value: 249 },
        { name: '国王', value: 219 },
        { name: '妖精', value: 218 },
        { name: '知道', value: 208 },
        { name: '看见', value: 184 },
        { name: '出来', value: 182 },
        { name: '小妖', value: 176 },
        { name: '没有', value: 163 },
        { name: '大圣', value: 159 },
        { name: '徒弟', value: 159 },
        { name: '猪八戒', value: 154 },
        { name: '来到', value: 139 },
        { name: '师徒', value: 134 },
    ];

    const option = createBarChartOption('后期高频词（第71-100回）', wordData.slice(0, 19));
    chart.setOption(option);
}

function initWordCloudSunwukong() {
    const containerId = 'wordcloud-sunwukong-chart';
    const chart = window.chartManager.initChart(containerId);

    // 用倾斜坐标轴增强文本可读性
    const keywords = [
        { name: '师父', value: 622 },
        { name: '唐僧', value: 481 },
        { name: '妖怪', value: 434 },
        { name: '八戒', value: 307 },
        { name: '菩萨', value: 226 },
        { name: '沙僧', value: 217 },
        { name: '只见', value: 166 },
        { name: '看见', value: 163 },
        { name: '金箍棒', value: 156 },
        { name: '铁棒', value: 154 },
        { name: '喊道', value: 153 },
        { name: '来到', value: 137 },
        { name: '变成', value: 133 },
        { name: '兄弟', value: 126 },
        { name: '猪八戒', value: 124 },
        { name: '呆子', value: 122 },
        { name: '出来', value: 120 },
        { name: '老孙', value: 117 },
        { name: '和尚', value: 115 },
        { name: '妖精', value: 107 },
    ];

    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: keywords.map(k => k.name),
            axisLabel: { color: '#333', interval: 0, rotate: 45 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#333' },
            splitLine: { lineStyle: { color: '#eee' } }
        },
        series: [{
            type: 'bar',
            data: keywords.map(k => k.value),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#667eea' },
                    { offset: 1, color: '#764ba2' }
                ])
            }
        }]
    };

    chart.setOption(option);
}

function initWordCloudTangMonk() {
    const containerId = 'wordcloud-tangmonk-chart';
    const chart = window.chartManager.initChart(containerId);

    // 唐僧关键词集中于佛教语汇，采用统一色系突出主题
    const keywords = [
        { name: '孙悟空', value: 735 },
        { name: '徒弟', value: 320 },
        { name: '八戒', value: 311 },
        { name: '沙僧', value: 262 },
        { name: '妖怪', value: 238 },
        { name: '行者', value: 147 },
        { name: '国王', value: 141 },
        { name: '悟空', value: 140 },
        { name: '菩萨', value: 132 },
        { name: '西天', value: 131 },
        { name: '取经', value: 123 },
        { name: '来到', value: 120 },
        { name: '和尚', value: 120 },
        { name: '看见', value: 119 },
        { name: '师徒', value: 111 },
        { name: '保护', value: 111 },
        { name: '猪八戒', value: 104 },
        { name: '只见', value: 100 },
        { name: '妖精', value: 100 },
        { name: '回来', value: 98 },
    ];

    const option = {
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: keywords.map(k => k.name),
            axisLabel: { color: '#333', interval: 0, rotate: 45 }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#333' },
            splitLine: { lineStyle: { color: '#eee' } }
        },
        series: [{
            type: 'bar',
            data: keywords.map(k => k.value),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#43e97b' },
                    { offset: 1, color: '#38f9d7' }
                ])
            }
        }]
    };

    chart.setOption(option);
}

/**
 * 创建条形图选项
 */
function createBarChartOption(title, data) {
    // 统一条形图的配色与坐标系，用于词频对比
    return {
        title: {
            text: title,
            left: 'center',
            textStyle: { color: '#667eea', fontSize: 15 }
        },
        tooltip: { trigger: 'axis' },
        grid: {
            bottom: '20%' // 增大底部内边距（默认约10%，改成20%让标签有下移的空间）
        },
        xAxis: {
            type: 'category',
            data: data.map(d => d.name),
            position: 'bottom', // 保持X轴在底部，配合offset下移
            offset: 10, // X轴相对于默认位置的下移量（数值越大，X轴越靠下，远离柱体）
            axisLabel: { color: '#333',
                align: 'center',       // 标签水平居中对齐柱体
                interval: 0,           // 强制显示所有标签，不自动隐藏（避免部分标签缺失导致视觉错位）
                verticalAlign: 'bottom',// 标签垂直方向靠下对齐（贴合X轴线）
                rotate: 0,             // 标签不旋转（如果旋转会导致对齐偏移）
                fontSize: 12           // 可选：调整标签字体大小，适配显示
            },
            axisTick: {
                alignWithLabel: true   // 让X轴的刻度线与标签对齐，进一步优化视觉效果
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: { color: '#333' },
            splitLine: { lineStyle: { color: '#eee' } }
        },
        series: [{
            type: 'bar',
            data: data.map(d => d.value),
            itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#667eea' },
                    { offset: 1, color: '#764ba2' }
                ])
            },
            emphasis: {
                itemStyle: { color: '#764ba2' }
            }
        }]
    };
}
