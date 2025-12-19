/**
 * 人物特征分析可视化
 */

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'character') {
            initCharacterCharts();
        }
    });

    if (document.getElementById('character').classList.contains('active')) {
        setTimeout(initCharacterCharts, 100);
    }
});

async function initCharacterCharts() {
    // 妖怪来历分布 - 饼图
    initDemonOriginChart();

    // 妖怪结局分布 - 饼图
    initDemonEndingChart();

    // 神仙派系对比 - 柱状图
    initDeityChartChart();
}

function initDemonOriginChart() {
    const containerId = 'demon-origin-chart';
    const chart = window.chartManager.initChart(containerId);

    // 这里采用简单饼图表达三类妖怪占比
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            textStyle: {
                color: '#333'
            }
        },
        series: [
            {
                name: '妖怪来历',
                type: 'pie',
                radius: '70%',
                data: [
                    { value: 35, name: '天庭下凡（神仙坐骑）' },
                    { value: 42, name: '本土成精' },
                    { value: 23, name: '其他' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#667eea' },
                        { offset: 1, color: '#764ba2' }
                    ])
                }
            }
        ]
    };

    chart.setOption(option);
}

function initDemonEndingChart() {
    const containerId = 'demon-ending-chart';
    const chart = window.chartManager.initChart(containerId);

    // 复用饼图模板展示不同结局的占比
    const option = {
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)'
        },
        legend: {
            orient: 'vertical',
            right: 'right',
            textStyle: {
                color: '#333'
            }
        },
        series: [
            {
                name: '妖怪结局',
                type: 'pie',
                radius: '70%',
                data: [
                    { value: 45, name: '被击杀' },
                    { value: 38, name: '被收服' },
                    { value: 17, name: '被神仙带回' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#43e97b' },
                        { offset: 1, color: '#38f9d7' }
                    ])
                }
            }
        ]
    };

    chart.setOption(option);
}

function initDeityChartChart() {
    const containerId = 'deity-sect-chart';
    const chart = window.chartManager.initChart(containerId);

    // 按章节段落对比道教与佛教出场频次
    const option = {
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            data: ['道教', '佛教'],
            textStyle: {
                color: '#333'
            }
        },
        xAxis: {
            type: 'category',
            data: ['第1-20回', '第21-40回', '第41-60回', '第61-80回', '第81-100回'],
            axisLabel: {
                color: '#333'
            }
        },
        yAxis: {
            type: 'value',
            axisLabel: {
                color: '#333'
            },
            splitLine: {
                lineStyle: {
                    color: '#eee'
                }
            }
        },
        series: [
            {
                name: '道教',
                type: 'bar',
                data: [12, 18, 15, 12, 8],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#667eea' },
                        { offset: 1, color: '#764ba2' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: '#764ba2'
                    }
                }
            },
            {
                name: '佛教',
                type: 'bar',
                data: [8, 12, 18, 22, 28],
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#43e97b' },
                        { offset: 1, color: '#38f9d7' }
                    ])
                },
                emphasis: {
                    itemStyle: {
                        color: '#38f9d7'
                    }
                }
            }
        ]
    };

    chart.setOption(option);
}
