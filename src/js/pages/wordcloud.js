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
        { name: '唐僧', value: 156 },
        { name: '孙悟空', value: 182 },
        { name: '猪八戒', value: 145 },
        { name: '沙和尚', value: 98 },
        { name: '妖怪', value: 167 },
        { name: '神仙', value: 134 },
        { name: '取经', value: 198 },
        { name: '灵山', value: 112 },
        { name: '修行', value: 89 },
        { name: '磨难', value: 105 },
        { name: '斗战', value: 95 },
        { name: '降妖', value: 87 },
        { name: '佛法', value: 76 },
        { name: '道法', value: 68 },
        { name: '徒弟', value: 91 },
        { name: '师父', value: 124 },
        { name: '长安', value: 45 },
        { name: '天庭', value: 78 }
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
            sizeRange: [24, 72],
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

    // 如果没有 WordCloud 组件，使用条形图代替
    if (!echarts.wordCloud) {
        // 在不引入扩展库的环境中保持页面可用
        option = createBarChartOption('全书高频词', wordData.slice(0, 10));
    }

    chart.setOption(option);
}

function initWordCloudEarly() {
    const containerId = 'wordcloud-early-chart';
    const chart = window.chartManager.initChart(containerId);

    const wordData = [
        { name: '大闹天宫', value: 145 },
        { name: '齐天大圣', value: 156 },
        { name: '孙悟空', value: 178 },
        { name: '石猴', value: 67 },
        { name: '取经', value: 89 },
        { name: '唐僧', value: 123 },
        { name: '猪八戒', value: 98 },
        { name: '妖怪', value: 145 },
        { name: '修行', value: 76 },
        { name: '徒弟', value: 65 },
        { name: '磨难', value: 82 },
        { name: '降妖', value: 71 },
        { name: '高老庄', value: 45 },
        { name: '黄风岭', value: 38 }
    ];

    const option = createBarChartOption('前期高频词（第1-30回）', wordData.slice(0, 8));
    chart.setOption(option);
}

function initWordCloudLate() {
    const containerId = 'wordcloud-late-chart';
    const chart = window.chartManager.initChart(containerId);

    const wordData = [
        { name: '取经', value: 189 },
        { name: '师父', value: 167 },
        { name: '灵山', value: 145 },
        { name: '如来佛祖', value: 134 },
        { name: '修行', value: 123 },
        { name: '佛法', value: 112 },
        { name: '功成', value: 98 },
        { name: '正果', value: 87 },
        { name: '成仙', value: 76 },
        { name: '阿弥陀佛', value: 89 },
        { name: '菩萨', value: 78 },
        { name: '佛经', value: 65 },
        { name: '极乐世界', value: 54 },
        { name: '开悟', value: 48 }
    ];

    const option = createBarChartOption('后期高频词（第71-100回）', wordData.slice(0, 8));
    chart.setOption(option);
}

function initWordCloudSunwukong() {
    const containerId = 'wordcloud-sunwukong-chart';
    const chart = window.chartManager.initChart(containerId);

    // 用倾斜坐标轴增强文本可读性
    const keywords = [
        { name: '俺老孙', value: 142 },
        { name: '大圣', value: 156 },
        { name: '斗战胜佛', value: 78 },
        { name: '筋斗云', value: 65 },
        { name: '金箍棒', value: 134 },
        { name: '降妖', value: 98 },
        { name: '护师父', value: 145 },
        { name: '变化', value: 87 }
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
        { name: '阿弥陀佛', value: 167 },
        { name: '徒弟', value: 145 },
        { name: '修行', value: 134 },
        { name: '取经', value: 198 },
        { name: '经文', value: 89 },
        { name: '佛法', value: 112 },
        { name: '功德', value: 78 },
        { name: '紧箍咒', value: 95 }
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
            textStyle: { color: '#667eea', fontSize: 14 }
        },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: data.map(d => d.name),
            axisLabel: { color: '#333' }
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
