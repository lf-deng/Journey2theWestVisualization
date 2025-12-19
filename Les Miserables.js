var dom = document.getElementById('container');
var myChart = echarts.init(dom, null, {
    renderer: 'canvas',
    useDirtyRect: false
});
var app = {};
var ROOT_PATH = 'https://echarts.apache.org/examples';
var option;

myChart.showLoading();
$.getJSON('les-miserables.json', function (graph) {
    myChart.hideLoading();
    graph.nodes.forEach(function (node) {
        node.label = {
            show: node.symbolSize > 30
        };
    });
    option = {
        // 图表的标题组件
        title: {
            text: 'Les Miserables', // 主标题文本
            subtext: 'Default layout', // 副标题文本
            top: 'bottom', // 标题组件离容器下侧的距离
            left: 'right' // 标题组件离容器右侧的距离
        },
        // 提示框组件，鼠标悬浮时显示
        tooltip: {
            formatter: function (params) {
                if (params.dataType === 'node') {
                    // 节点 tooltip
                    // 使用 rich text 和 marker 来模拟默认样式
                    var str = params.seriesName + '<br/>' +
                        params.marker + params.name +
                        '<b style="float:right; margin-left:20px">'
                        + params.value + '</b>';
                    if (params.data.recomend) {
                        str += '<br/>Recomend: ' + params.data.recomend;
                    }
                    return str;
                } else {
                    // 边 tooltip
                    return params.data.relation || '';
                }
            }
        }, // 使用默认配置
        // 图例组件，用于筛选系列
        legend: [
            {
                // 图例的数据数组，这里从`graph.categories`动态生成
                data: graph.categories.map(function (a) {
                    return a.name;
                })
            }
        ],
        // 初始动画的时长
        animationDuration: 1500,
        // 数据更新动画的缓动效果
        animationEasingUpdate: 'quinticInOut',
        // 系列列表。每个系列通过 type 决定自己的图表类型
        series: [
            {
                name: 'Les Miserables', // 系列名称，用于tooltip的显示，legend 的图例筛选
                type: 'graph', // 图表类型为关系图
                legendHoverLink: false, // 禁用图例悬停时的高亮联动
                layout: 'none', // 图的布局。'none'表示使用节点数据中的 x, y 作为节点的位置
                data: graph.nodes, // 节点数据
                links: graph.links, // 节点间的关系数据
                categories: graph.categories, // 节点分类的类目
                roam: true, // 开启鼠标缩放和平移漫游
                // 节点标签的样式
                label: {
                    position: 'right', // 标签位置
                    formatter: '{b}' // 标签内容格式器，{b} 表示数据项的名称
                },
                // 关系边的线条样式
                lineStyle: {
                    color: 'source', // 边的颜色使用源节点的颜色
                    curveness: 0.3 // 边的曲度
                },
                // 边的文本标签配置
                edgeLabel: {
                    show: true, // 显示边的标签
                    formatter: function (params) {
                        // params.data 包含边的原始数据项
                        // 这里我们返回 source 和 target 节点的名称
                        // 二者都大于 30 时才显示边的标签
                        return params.data.relation || "";
                    }
                },
                // 高亮状态下的图形和标签样式
                emphasis: {
                    focus: 'adjacency', // 聚焦关系图中的邻接点和边
                    // 高亮状态下的边的样式
                    lineStyle: {
                        width: 10 // 边宽变为10
                    }
                }
            }
        ]
    };
    myChart.setOption(option);
});

if (option && typeof option === 'object') {
    myChart.setOption(option);
}

window.addEventListener('resize', myChart.resize);