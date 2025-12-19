/**
 * 人物关系网络可视化
 */

document.addEventListener('DOMContentLoaded', () => {
    // 监听页面切换事件
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'network') {
            initNetworkChart();
        }
    });

    // 页面初始化完成后，如果已在该页面则初始化
    if (document.getElementById('network').classList.contains('active')) {
        setTimeout(initNetworkChart, 100);
    }
});

async function initNetworkChart() {
    const containerId = 'network-chart';
    const chart = window.chartManager.initChart(containerId);

    // 样例数据：人物关系网络
    const networkData = {
        nodes: [
            { name: '唐僧', value: 100, category: '主角' },
            { name: '孙悟空', value: 150, category: '主角' },
            { name: '猪八戒', value: 120, category: '主角' },
            { name: '沙和尚', value: 80, category: '主角' },
            { name: '如来佛祖', value: 60, category: '神仙' },
            { name: '观世音菩萨', value: 85, category: '神仙' },
            { name: '玉皇大帝', value: 55, category: '神仙' },
            { name: '孙行者', value: 90, category: '妖怪' },
            { name: '白骨精', value: 70, category: '妖怪' },
            { name: '铁扇公主', value: 65, category: '妖怪' },
            { name: '牛魔王', value: 60, category: '妖怪' },
            { name: '蜘蛛精', value: 45, category: '妖怪' },
            { name: '黑熊怪', value: 40, category: '妖怪' }
        ],
        links: [
            { source: '唐僧', target: '孙悟空', value: 95 },
            { source: '唐僧', target: '猪八戒', value: 80 },
            { source: '唐僧', target: '沙和尚', value: 85 },
            { source: '孙悟空', target: '猪八戒', value: 70 },
            { source: '孙悟空', target: '沙和尚', value: 65 },
            { source: '猪八戒', target: '沙和尚', value: 60 },
            { source: '唐僧', target: '观世音菩萨', value: 50 },
            { source: '孙悟空', target: '如来佛祖', value: 40 },
            { source: '孙悟空', target: '玉皇大帝', value: 35 },
            { source: '孙悟空', target: '白骨精', value: 55 },
            { source: '孙悟空', target: '铁扇公主', value: 50 },
            { source: '猪八戒', target: '铁扇公主', value: 45 },
            { source: '孙悟空', target: '牛魔王', value: 48 },
            { source: '孙悟空', target: '蜘蛛精', value: 35 },
            { source: '孙悟空', target: '黑熊怪', value: 30 }
        ],
        categories: [
            { name: '主角', itemStyle: { color: '#667eea' } },
            { name: '神仙', itemStyle: { color: '#43e97b' } },
            { name: '妖怪', itemStyle: { color: '#fa709a' } }
        ]
    };

    // Force 布局用于模拟人物间的势力牵引关系
    const option = {
        title: {
            text: '西游记人物关系网络',
            top: 'top',
            left: 'center',
            textStyle: {
                fontSize: 16,
                fontWeight: 'bold',
                color: '#667eea'
            }
        },
        tooltip: {
            formatter: function (params) {
                if (params.dataType === 'node') {
                    return `${params.name}<br/>出场频率: ${params.value}`;
                } else if (params.dataType === 'edge') {
                    return `${params.data.source} ↔ ${params.data.target}<br/>关联度: ${params.data.value}`;
                }
            }
        },
        legend: [
            {
                data: networkData.categories.map(a => a.name),
                top: 'bottom',
                textStyle: {
                    color: '#333'
                }
            }
        ],
        animationDuration: 1500,
        animationEasingUpdate: 'quinticInOut',
        series: [
            {
                name: '西游记人物关系',
                type: 'graph',
                layout: 'force',
                data: networkData.nodes,
                links: networkData.links,
                categories: networkData.categories,
                roam: true,
                label: {
                    show: true,
                    position: 'right',
                    formatter: '{b}',
                    fontSize: 12,
                    color: '#333'
                },
                lineStyle: {
                    color: '#999',
                    curveness: 0.3,
                    opacity: 0.5
                },
                edgeLabel: {
                    show: false
                },
                emphasis: {
                    focus: 'adjacency',
                    lineStyle: {
                        width: 3,
                        opacity: 1,
                        color: '#667eea'
                    },
                    label: {
                        show: true,
                        fontSize: 13,
                        fontWeight: 'bold'
                    }
                },
                force: {
                    // 调整斥力和吸引力，让节点分布更均衡
                    repulsion: 100,
                    gravity: 0.1,
                    edgeLength: [100, 150],
                    friction: 0.5,
                    layoutAnimation: true
                }
            }
        ]
    };

    chart.setOption(option);

    // 更新统计信息
    updateNetworkStats(networkData);
}

function updateNetworkStats(data) {
    const statsDiv = document.getElementById('network-stats');
    const nodeCount = data.nodes.length;
    const linkCount = data.links.length;
    const mainCharacters = data.nodes
        .filter(n => n.category === '主角')
        .map(n => n.name)
        .join('、');

    statsDiv.innerHTML = `
        <strong>节点总数：</strong>${nodeCount}<br>
        <strong>关系总数：</strong>${linkCount}<br>
        <strong>主角：</strong>${mainCharacters}<br>
        <strong>图表交互：</strong>可拖拽和缩放
    `;
}
