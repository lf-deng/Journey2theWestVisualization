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

    // 人物情感倾向
    initSentimentDistribution();
}

function initSentimentKeywords() {
    const containerId = 'sentiment-keywords-chart';
    const chart = window.chartManager.initChart(containerId);

    const keywordsData = [
        { name: '聪慧', value: 156 },
        { name: '勇敢', value: 145 },
        { name: '叛逆', value: 134 },
        { name: '忠诚', value: 167 },
        { name: '善良', value: 189 },
        { name: '执着', value: 178 },
        { name: '幽默', value: 145 },
        { name: '贪婪', value: 123 },
        { name: '懒惰', value: 98 },
        { name: '人性化', value: 112 },
        { name: '憨厚', value: 134 },
        { name: '尽职', value: 145 },
        { name: '温和', value: 121 },
        { name: '坚定', value: 167 },
        { name: '顽皮', value: 102 },
        { name: '机敏', value: 143 }
    ];

    // 创建词云效果的气泡图
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}次'
        },
        series: [{
            type: 'scatter',
            symbolSize: function (val) {
                // 对 mention 值开平方，平衡气泡大小差异
                return Math.sqrt(val[2]) * 5;
            },
            data: keywordsData.map((d, i) => [
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

    chart.setOption(option);
}

function initSentimentDistribution() {
    const containerId = 'sentiment-distribution-chart';
    const chart = window.chartManager.initChart(containerId);

    const sentimentData = [
        { name: '正面评价', value: 62 },
        { name: '中立评价', value: 24 },
        { name: '负面评价', value: 14 }
    ];

    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c}%'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: { color: '#333' }
        },
        series: [{
            name: '情感倾向',
            type: 'pie',
            radius: '70%',
            data: sentimentData,
            // 使用圆角让切片视觉更柔和
            itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
            },
            label: {
                show: true,
                position: 'outside',
                formatter: '{b}: {d}%'
            },
            color: ['#43e97b', '#4facfe', '#fa709a']
        }]
    };

    chart.setOption(option);
}
