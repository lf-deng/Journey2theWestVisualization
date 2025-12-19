/**
 * 取经路线交互式可视化
 */

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'route') {
            initRouteChart();
        }
    });

    if (document.getElementById('route').classList.contains('active')) {
        setTimeout(initRouteChart, 100);
    }
});

async function initRouteChart() {
    const containerId = 'route-chart';
    const chart = window.chartManager.initChart(containerId);

    // 样例数据：取经路线
    const routeData = [
        { name: '长安', coord: [114.21892734521, 36.6171245705068], value: 0, events: '唐僧出发' },
        { name: '两界山', coord: [113.5, 36.8], value: 50, events: '孙悟空被救' },
        { name: '高老庄', coord: [113.0, 37.0], value: 100, events: '猪八戒入队' },
        { name: '黄风岭', coord: [112.5, 37.2], value: 150, events: '黄风怪难' },
        { name: '流沙河', coord: [112.0, 37.5], value: 200, events: '沙和尚入队' },
        { name: '火焰山', coord: [111.0, 38.0], value: 300, events: '铁扇公主阻挡' },
        { name: '狮驼国', coord: [110.0, 38.5], value: 350, events: '三只狮子精' },
        { name: '灵山', coord: [108.0, 39.0], value: 400, events: '成功取经' }
    ];

    // 组合地理坐标叠加线图与散点，模拟取经路线巡游
    const option = {
        backgroundColor: '#fafafa',
        title: {
            text: '唐僧师徒四人取经路线',
            top: 'top',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#667eea'
            }
        },
        tooltip: {
            trigger: 'item',
            formatter: function (params) {
                if (params.componentSubType === 'scatter') {
                    return `${params.name}<br/>进度: ${params.value}%<br/>事件: ${params.data.events}`;
                } else if (params.componentSubType === 'line') {
                    return '取经路线';
                }
                return '';
            }
        },
        geo: {
            map: 'china',
            roam: true,
            label: {
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#323c48',
                    borderColor: '#404a59'
                },
                emphasis: {
                    areaColor: '#2a333d'
                }
            }
        },
        series: [
            {
                name: '取经路线',
                type: 'lines',
                coordinateSystem: 'geo',
                data: generateRouteLines(routeData),
                lineStyle: {
                    normal: {
                        color: '#667eea',
                        width: 3,
                        curveness: 0.2,
                        opacity: 0.8
                    },
                    emphasis: {
                        width: 5,
                        opacity: 1
                    }
                },
                smooth: true,
                symbolSize: 15,
                hoverAnimation: true
            },
            {
                name: '停留地点',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: routeData,
                symbolSize: function (val) {
                    return val[2] / 50;
                },
                label: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#667eea' },
                        { offset: 1, color: '#764ba2' }
                    ]),
                    shadowBlur: 10,
                    shadowColor: 'rgba(102, 126, 234, 0.5)'
                },
                emphasis: {
                    label: {
                        show: true
                    },
                    itemStyle: {
                        shadowBlur: 15,
                        shadowColor: '#667eea'
                    }
                }
            },
            {
                name: '取经进度',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                data: routeData.sort((a, b) => a.value - b.value),
                symbolSize: function (val) {
                    return val[2] / 60;
                },
                showEffectOn: 'render',
                rippleEffect: {
                    brushType: 'stroke',
                    scale: 3,
                    period: 4
                },
                hoverAnimation: true,
                label: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                itemStyle: {
                    color: '#43e97b',
                    shadowBlur: 10,
                    shadowColor: 'rgba(67, 233, 123, 0.5)'
                },
                zlevel: 1
            }
        ]
    };

    chart.setOption(option);

    // 更新统计信息
    updateRouteStats(routeData);
}

function generateRouteLines(data) {
    const lines = [];
    for (let i = 0; i < data.length - 1; i++) {
        // 将相邻地点的坐标拼成线路段
        lines.push([
            [data[i].coord[0], data[i].coord[1]],
            [data[i + 1].coord[0], data[i + 1].coord[1]]
        ]);
    }
    return lines;
}

function updateRouteStats(data) {
    const infoDiv = document.getElementById('route-info');
    const statsDiv = document.getElementById('route-stats');

    const locations = data.map(d => d.name).join(' → ');
    const events = data.map(d => `${d.name}（${d.events}）`).join('<br>');

    // 使用简单字符串拼接输出统计摘要
    infoDiv.innerHTML = `<strong>主要停留地：</strong><br>${locations}`;
    statsDiv.innerHTML = `<strong>总路线：</strong>${data.length}个地点<br><strong>估计耗时：</strong>14年`;
}
