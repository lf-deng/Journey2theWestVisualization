/**
 * 人物关系网络可视化 - 优化版
 */

// 全局变量
let allNetworkData = null;
let currentFilterMode = 'all'; // 'all' 或 'main'
let selectedNodes = []; // 存储选中的节点（最多两个）
let currentChart = null; // 存储当前图表实例

// 人物别名映射表
const ALIAS_MAP = {
    '唐三藏': '唐僧',
    '沙僧': '沙和尚',
    '沙悟净': '沙和尚',
    '小白龙': '白龙马',
    '悟空': '孙悟空',
    '美猴王': '孙悟空',
    '齐天大圣': '孙悟空',
    '孙大圣': '孙悟空',
    '老孙': '孙悟空',
    '猴王': '孙悟空',
    '八戒': '猪八戒',
    '老猪': '猪八戒',
    '天蓬元帅': '猪八戒'
};

// 获取人物的标准名称
function getStandardName(name) {
    return ALIAS_MAP[name] || name;
}

document.addEventListener('DOMContentLoaded', () => {
    window.addEventListener('pageLoaded', (e) => {
        if (e.detail.page === 'network') {
            initNetworkChart();
        }
    });

    if (document.getElementById('network').classList.contains('active')) {
        setTimeout(initNetworkChart, 100);
    }
});

async function initNetworkChart() {
    const containerId = 'network-chart';
    // 假设 window.chartManager 存在，若不存在请直接使用 echarts.init
    const chart = window.chartManager ? window.chartManager.initChart(containerId) : echarts.init(document.getElementById(containerId));

    chart.showLoading(); // 显示加载动画

    try {
        const response = await fetch('src/data/network-data-xiyoujiKG.json');
        if (!response.ok) throw new Error('无法加载网络数据');
        
        allNetworkData = await response.json();
        
        // 数据预处理
        allNetworkData.nodes = allNetworkData.nodes.map(node => ({
            ...node,
            name: node.name || node.id
        }));
        
        allNetworkData = mergeAliases(allNetworkData);
        
        console.log('✓ 成功加载网络数据:', {
            节点数: allNetworkData.nodes.length,
            边数: allNetworkData.links.length
        });

        chart.hideLoading();

    } catch (error) {
        chart.hideLoading();
        console.error('加载数据失败:', error);
        chart.setOption({
            title: {
                text: '数据加载失败，请检查文件路径',
                left: 'center',
                top: 'center',
                textStyle: { color: '#fa709a', fontSize: 16 }
            }
        });
        return;
    }

    currentChart = chart; // 保存图表实例
    createFilterControls();
    updateChart(chart, allNetworkData, currentFilterMode);
}

// ... mergeAliases 函数保持不变，此处省略以节省篇幅 ...
function mergeAliases(data) {
    const nodeMap = new Map(); 
    const nameToStandard = new Map(); 
    
    data.nodes.forEach(node => {
        const standardName = getStandardName(node.name);
        nameToStandard.set(node.name, standardName);
    });
    
    data.nodes.forEach(node => {
        const standardName = getStandardName(node.name);
        if (!nodeMap.has(standardName)) {
            nodeMap.set(standardName, {
                id: standardName,
                name: standardName,
                category: node.category,
                value: node.value,
                aliases: node.name !== standardName ? [node.name] : []
            });
        } else {
            const existing = nodeMap.get(standardName);
            existing.value += node.value;
            if (node.category === '主角') existing.category = '主角';
            if (node.name !== standardName && !existing.aliases.includes(node.name)) {
                existing.aliases.push(node.name);
            }
        }
    });
    
    const linkMap = new Map(); 
    data.links.forEach(link => {
        const standardSource = getStandardName(link.source);
        const standardTarget = getStandardName(link.target);
        if (standardSource === standardTarget) return;
        
        const key = standardSource < standardTarget 
            ? `${standardSource}|||${standardTarget}`
            : `${standardTarget}|||${standardSource}`;
        
        if (!linkMap.has(key)) {
            linkMap.set(key, {
                source: standardSource < standardTarget ? standardSource : standardTarget,
                target: standardSource < standardTarget ? standardTarget : standardSource,
                value: link.value,
                relation: link.relation || ''
            });
        } else {
            const existing = linkMap.get(key);
            existing.value += link.value;
            if (link.relation && existing.relation && link.relation !== existing.relation) {
                existing.relation = `${existing.relation}/${link.relation}`;
            } else if (link.relation && !existing.relation) {
                existing.relation = link.relation;
            }
        }
    });
    
    return {
        nodes: Array.from(nodeMap.values()),
        links: Array.from(linkMap.values()),
        categories: data.categories
    };
}

// ... createFilterControls, updateFilterButtons, filterNetworkData 函数保持不变 ...
// (为了代码完整性，请保留原有的这些筛选逻辑函数，逻辑没有问题)
function createFilterControls() {
    const statsDiv = document.getElementById('network-stats');
    if (!statsDiv) return;

    const filterHTML = `
        <div style="margin-bottom: 1rem;">
            <strong>视图模式：</strong>
            <button id="filter-all" class="filter-btn active" style="margin-right: 0.5rem; padding: 0.5rem 1rem; border: 1px solid #667eea; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">全部人物</button>
            <button id="filter-main" class="filter-btn" style="padding: 0.5rem 1rem; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 4px; cursor: pointer;">主要人物</button>
        </div>
        <div style="margin-bottom: 1rem; padding: 0.75rem; background: #f5f5f5; border-radius: 4px;">
            <strong style="display: block; margin-bottom: 0.5rem;">🔍 人物检索：</strong>
            <div style="display: flex; gap: 0.5rem;">
                <input type="text" id="character-search" placeholder="输入人物名称搜索..." 
                    style="flex: 1; padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
                <button id="search-btn" style="padding: 0.5rem 1rem; border: 1px solid #667eea; background: #667eea; color: white; border-radius: 4px; cursor: pointer;">搜索</button>
                <button id="clear-search-btn" style="padding: 0.5rem 1rem; border: 1px solid #999; background: white; color: #666; border-radius: 4px; cursor: pointer;">清除</button>
            </div>
            <div id="search-results" style="margin-top: 0.5rem; font-size: 0.85rem; color: #666;"></div>
        </div>
        <div id="relationship-display" style="margin-bottom: 1rem; padding: 0.75rem; background: #e8f4f8; border-radius: 4px; display: none;">
            <strong style="display: block; margin-bottom: 0.5rem; color: #667eea;">🔗 关系详情：</strong>
            <div id="relationship-content" style="line-height: 1.8;"></div>
            <button id="clear-relationship-btn" style="margin-top: 0.5rem; padding: 0.4rem 0.8rem; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">清除选择</button>
        </div>
        <div id="network-stats-content" style="line-height: 2;">
            <strong>节点总数：</strong><span id="node-count">-</span><br>
            <strong>关系总数：</strong><span id="link-count">-</span><br>
            <strong>主角：</strong><span id="main-characters">-</span><br>
            <span style="color: #666; font-size: 0.9em;">* 滚轮缩放，点击高亮，双击选择节点（选择两个节点查看关系）</span>
        </div>
    `;
    
    statsDiv.innerHTML = filterHTML;

    // 视图模式切换
    document.getElementById('filter-all').addEventListener('click', () => {
        currentFilterMode = 'all';
        updateFilterButtons();
        const chart = window.chartManager.getChart('network-chart');
        if (chart && allNetworkData) {
            // 检查选中的节点是否在新视图中存在
            const filteredData = filterNetworkData(allNetworkData, 'all');
            const availableNodeIds = new Set(filteredData.nodes.map(n => n.id));
            selectedNodes = selectedNodes.filter(n => availableNodeIds.has(n.id));
            updateChart(chart, allNetworkData, 'all');
        }
    });

    document.getElementById('filter-main').addEventListener('click', () => {
        currentFilterMode = 'main';
        updateFilterButtons();
        const chart = window.chartManager.getChart('network-chart');
        if (chart && allNetworkData) {
            // 检查选中的节点是否在新视图中存在
            const filteredData = filterNetworkData(allNetworkData, 'main');
            const availableNodeIds = new Set(filteredData.nodes.map(n => n.id));
            selectedNodes = selectedNodes.filter(n => availableNodeIds.has(n.id));
            updateChart(chart, allNetworkData, 'main');
        }
    });

    // 搜索功能
    const searchInput = document.getElementById('character-search');
    const searchBtn = document.getElementById('search-btn');
    const clearSearchBtn = document.getElementById('clear-search-btn');
    const searchResults = document.getElementById('search-results');

    const performSearch = () => {
        const query = searchInput.value.trim();
        if (!query) {
            searchResults.innerHTML = '';
            return;
        }

        if (!allNetworkData) return;

        // 搜索匹配的节点（支持别名和部分匹配）
        const queryLower = query.toLowerCase();
        
        // 构建反向映射：从标准名称到所有可能的别名（包括别名映射表中的）
        const reverseAliasMap = {};
        Object.entries(ALIAS_MAP).forEach(([alias, standard]) => {
            if (!reverseAliasMap[standard]) {
                reverseAliasMap[standard] = [];
            }
            reverseAliasMap[standard].push(alias);
        });
        
        const matches = allNetworkData.nodes.filter(node => {
            const name = node.name.toLowerCase();
            
            // 1. 检查标准名称是否包含查询词
            if (name.includes(queryLower)) return true;
            
            // 2. 检查节点自带的别名是否包含查询词
            if (node.aliases && node.aliases.some(alias => alias.toLowerCase().includes(queryLower))) return true;
            
            // 3. 检查别名映射表中的别名是否包含查询词
            // 例如：搜索"三藏"，应该能找到"唐僧"（因为"唐三藏"→"唐僧"，且"唐三藏"包含"三藏"）
            const possibleAliases = reverseAliasMap[node.name] || [];
            if (possibleAliases.some(alias => alias.toLowerCase().includes(queryLower))) return true;
            
            // 4. 检查查询词是否是某个别名的标准名称（反向查找）
            const standardName = getStandardName(query);
            if (standardName === node.name || standardName === node.id) return true;
            
            return false;
        });

        if (matches.length === 0) {
            searchResults.innerHTML = `<span style="color: #e74c3c;">未找到匹配的人物</span>`;
            return;
        }

        // 显示搜索结果
        if (matches.length <= 5) {
            searchResults.innerHTML = `找到 ${matches.length} 个匹配：${matches.map(m => m.name).join('、')}`;
        } else {
            searchResults.innerHTML = `找到 ${matches.length} 个匹配，显示前5个：${matches.slice(0, 5).map(m => m.name).join('、')}...`;
        }

        // 定位到第一个匹配的节点
        if (matches.length > 0) {
            locateNode(matches[0].id);
        }
    };

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchResults.innerHTML = '';
        if (currentChart) {
            currentChart.dispatchAction({ type: 'downplay' });
        }
    });

    // 清除关系显示
    document.getElementById('clear-relationship-btn').addEventListener('click', () => {
        selectedNodes = [];
        document.getElementById('relationship-display').style.display = 'none';
        if (currentChart) {
            currentChart.dispatchAction({ type: 'downplay' });
        }
    });
}

function updateFilterButtons() {
    const allBtn = document.getElementById('filter-all');
    const mainBtn = document.getElementById('filter-main');
    const activeStyle = "margin-right: 0.5rem; padding: 0.5rem 1rem; border: 1px solid #667eea; background: #667eea; color: white; border-radius: 4px; cursor: pointer;";
    const inactiveStyle = "margin-right: 0.5rem; padding: 0.5rem 1rem; border: 1px solid #667eea; background: white; color: #667eea; border-radius: 4px; cursor: pointer;";
    
    if (currentFilterMode === 'all') {
        allBtn.style.cssText = activeStyle;
        mainBtn.style.cssText = inactiveStyle;
    } else {
        mainBtn.style.cssText = activeStyle;
        allBtn.style.cssText = inactiveStyle;
    }
}

function filterNetworkData(data, mode) {
    if (mode === 'all') return data;

    // main 模式：按“关系数（不同邻居数）”从高到低排序，取前 20 个人物
    const sortedNodes = [...data.nodes].sort((a, b) => b.value - a.value);
    const topN = 20;
    const mainNodesSet = new Set(sortedNodes.slice(0, topN).map(n => n.id));

    const filteredNodes = data.nodes.filter(node => mainNodesSet.has(node.id));
    const filteredLinks = data.links.filter(
        link => mainNodesSet.has(link.source) && mainNodesSet.has(link.target)
    );

    return { nodes: filteredNodes, links: filteredLinks, categories: data.categories };
}

// 辅助计算函数
function calculateNodeSize(value, minValue, maxValue) {
    if (maxValue === minValue) return 30;
    const normalized = (value - minValue) / (maxValue - minValue);
    return 15 + normalized * 45; // 稍微调大一点：15-60
}

function calculateLinkWidth(value, minValue, maxValue) {
    if (maxValue === minValue) return 3;
    const normalized = (value - minValue) / (maxValue - minValue);
    // 加大连线粗细的对比，从约 1px ~ 9px
    return 1 + normalized * 8; 
}

// 存储固定状态 (ID Set)
const fixedNodes = new Set();

/**
 * 核心修改：更新图表函数
 */
function updateChart(chart, data, filterMode) {
    chart.clear(); // 清除旧配置，避免遗留状态干扰

    const filteredData = filterNetworkData(data, filterMode);
    
    // 计算极值（节点）
    const nodeValues = filteredData.nodes.map(n => n.value);
    const minNodeValue = Math.min(...nodeValues);
    const maxNodeValue = Math.max(...nodeValues);

    // 建立节点 value 映射表，后面用来按两端节点的重要性计算边的“强度”
    const nodeValueMap = {};
    filteredData.nodes.forEach(n => {
        nodeValueMap[n.id] = n.value;
    });

    // 计算每条边的“强度”：用两端节点 value 的平均值表示
    const linkStrengths = filteredData.links.map(l => {
        const sourceValue = nodeValueMap[l.source] || 1;
        const targetValue = nodeValueMap[l.target] || 1;
        return (sourceValue + targetValue) / 2;
    });
    const minLinkStrength = linkStrengths.length > 0 ? Math.min(...linkStrengths) : 1;
    const maxLinkStrength = linkStrengths.length > 0 ? Math.max(...linkStrengths) : 1;

    // 容器中心
    const containerWidth = chart.getWidth();
    const containerHeight = chart.getHeight();
    
    // 数据格式化
    const nodes = filteredData.nodes.map(node => {
        const isFixed = fixedNodes.has(node.id);
        // 孙悟空始终居中并固定（无论哪个视图模式）
        let x = null, y = null;
        let shouldFix = isFixed;
        
        // 检查是否是孙悟空（考虑别名情况，使用标准名称）
        const standardName = getStandardName(node.name || node.id);
        if (standardName === '孙悟空' || node.id === '孙悟空' || node.name === '孙悟空') {
            x = containerWidth / 2;
            y = containerHeight / 2;
            shouldFix = true; // 固定孙悟空位置
        }
        
        // 关系数为0的节点：放到边缘位置，避免挡在中间
        let nodeX = x !== null ? x : (node.x || null);
        let nodeY = y !== null ? y : (node.y || null);
        if (node.value === 0 && !shouldFix && nodeX === null) {
            // 随机放到边缘位置（左上、右上、左下、右下）
            const edge = Math.floor(Math.random() * 4);
            const margin = 50; // 边缘边距
            if (edge === 0) { // 左上
                nodeX = margin;
                nodeY = margin;
            } else if (edge === 1) { // 右上
                nodeX = containerWidth - margin;
                nodeY = margin;
            } else if (edge === 2) { // 左下
                nodeX = margin;
                nodeY = containerHeight - margin;
            } else { // 右下
                nodeX = containerWidth - margin;
                nodeY = containerHeight - margin;
            }
        }

        return {
            ...node,
            symbolSize: calculateNodeSize(node.value, minNodeValue, maxNodeValue),
            fixed: shouldFix, // ECharts 只有 true/false，位置由 x/y 决定
            x: nodeX,
            y: nodeY,
            // 关系数为0的节点降低斥力权重，让它们不影响重要节点
            // 通过设置一个很小的 symbolSize 权重来实现（ECharts 会根据节点大小计算斥力）
            // 优化：设置 label 避免默认太乱
            label: {
                show: node.value > (maxNodeValue * 0.3) || node.category === '主角' // 只有重要人物默认显示名字
            }
        };
    });

    const links = filteredData.links.map((link, index) => {
        const strength = linkStrengths[index] || 1;
        return {
            ...link,
            // 保存一个专门用于展示的“关系强度”，基于两端节点的连接数
            strength,
            lineStyle: {
                width: calculateLinkWidth(strength, minLinkStrength, maxLinkStrength),
                curveness: 0.2, // 稍微弯曲一点好看
                opacity: 0.5
            }
        };
    });

    const option = {
        title: {
            text: filterMode === 'all' ? '西游记人物关系网络' : '核心人物关系网络',
            top: 20,
            left: 'center',
            textStyle: { color: '#333', fontSize: 18 }
        },
        tooltip: {
            trigger: 'item',
            formatter: (params) => {
                if (params.dataType === 'node') {
                    const aliases = params.data.aliases && params.data.aliases.length > 0 
                        ? `<br/>别名: ${params.data.aliases.join('、')}` : '';
                    return `
                        <div style="font-weight:bold">${params.name}</div>
                        类别: ${params.data.category}<br/>
                        关系数: ${params.value}${aliases}
                    `;
                } else {
                    // 边上只展示关系类型，不再显示具体数值的关系强度
                    return `${params.data.source} ↔ ${params.data.target}<br/>关系: ${params.data.relation || '关联'}`;
                }
            }
        },
        legend: [{
            data: filteredData.categories.map(a => a.name),
            bottom: 20,
            icon: 'circle'
        }],
        series: [{
            name: '西游记',
            type: 'graph',
            layout: 'force',
            data: nodes,
            links: links,
            categories: filteredData.categories,
            roam: true, // 开启原生缩放和平移
            draggable: true, // 允许拖拽，但我们会降低力导向的“弹性”以减少大幅晃动
            focusNodeAdjacency: false, // 关闭旧版的高亮，使用新版 emphasis.focus
            
            // 标签配置
            label: {
                show: true,
                position: 'right',
                formatter: '{b}'
            },
            
            // 高亮样式 (ECharts 5+ 推荐写法)
            emphasis: {
                focus: 'adjacency', // 核心：鼠标悬停/点击时，只显示相邻节点
                lineStyle: {
                    width: 4,
                    opacity: 1
                },
                itemStyle: {
                    shadowBlur: 10,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            },
            
            // 力引导布局配置：适度减弱弹性，避免轻微拖拽引起大幅晃动
            force: {
                // 斥力：整体降低，让节点之间“推开”的力小一些
                repulsion: [50, 300],
                // 边长：适当增大下限，让布局更“紧一些”但不至于太挤
                edgeLength: [80, 220],
                // 摩擦力：调高到 0.85，拖动后更快稳定下来，减少抖动
                friction: 0.85,
                // 引力：略微增大，让整体收拢一点，减少大幅飞出
                gravity: 0.2,
                // 布局动画：保持启用，但在摩擦较高时运动幅度会明显减小
                layoutAnimation: true
            },
            
            lineStyle: {
                color: 'source',
                curveness: 0.2
            }
        }]
    };

    chart.setOption(option);

    // 更新统计
    updateNetworkStats(filteredData);
    
    // 如果之前有选中的节点，重新高亮它们
    if (selectedNodes.length > 0) {
        setTimeout(() => {
            highlightSelectedNodes(chart);
            updateRelationshipDisplay();
        }, 100);
    }
    
    // --- 绑定事件 (使用新的逻辑) ---
    chart.off('click');
    chart.off('dblclick');
    
    // 1. 点击事件：点击空白处取消高亮
    chart.getZr().on('click', (params) => {
        if (!params.target) {
            // 点击了空白处，取消所有高亮效果
            chart.dispatchAction({
                type: 'downplay'
            });
        }
    });

    // 2. 节点点击事件：手动触发高亮 (持久化，类似鼠标悬停效果)
    chart.on('click', (params) => {
        if (params.dataType === 'node') {
            // 先取消所有高亮
            chart.dispatchAction({ type: 'downplay' });
            // 然后高亮当前节点和它的所有相邻节点及连线
            chart.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: params.dataIndex
            });
        }
    });

    // 3. 双击事件：选择节点（用于查看关系）
    chart.on('dblclick', (params) => {
        if (params.dataType === 'node') {
            const nodeId = params.data.id;
            const nodeName = params.data.name;
            
            // 检查是否已选中
            const existingIndex = selectedNodes.findIndex(n => n.id === nodeId);
            
            if (existingIndex >= 0) {
                // 如果已选中，则取消选择
                selectedNodes.splice(existingIndex, 1);
            } else {
                // 如果未选中，添加到选择列表
                if (selectedNodes.length >= 2) {
                    // 如果已有两个，移除第一个，添加新的
                    selectedNodes.shift();
                }
                selectedNodes.push({ id: nodeId, name: nodeName });
            }
            
            // 更新关系显示
            updateRelationshipDisplay();
            
            // 高亮选中的节点
            highlightSelectedNodes(chart);
        }
    });
    
    // 自动 resize
    window.addEventListener('resize', () => chart.resize());
}

function updateNetworkStats(data) {
    const nodeCountEl = document.getElementById('node-count');
    const linkCountEl = document.getElementById('link-count');
    const mainCharsEl = document.getElementById('main-characters');
    
    if (nodeCountEl) nodeCountEl.textContent = data.nodes.length;
    if (linkCountEl) linkCountEl.textContent = data.links.length;
    
    if (mainCharsEl) {
        const mainCharacters = data.nodes
            .filter(n => n.category === '主角')
            .map(n => n.name);
        mainCharsEl.textContent = mainCharacters.join('、');
    }
}

// 定位到指定节点
function locateNode(nodeId) {
    if (!currentChart || !allNetworkData) return;
    
    const currentOption = currentChart.getOption();
    if (!currentOption || !currentOption.series || !currentOption.series[0]) return;
    
    const nodes = currentOption.series[0].data;
    const nodeIndex = nodes.findIndex(n => n.id === nodeId);
    
    if (nodeIndex >= 0) {
        // 高亮节点及其相邻节点
        currentChart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: nodeIndex
        });
        
        // 尝试通过修改节点样式来突出显示
        const node = nodes[nodeIndex];
        if (node) {
            // 临时增大节点大小以突出显示
            const originalSize = node.symbolSize;
            currentChart.setOption({
                series: [{
                    data: nodes.map((n, idx) => {
                        if (idx === nodeIndex) {
                            return {
                                ...n,
                                symbolSize: Math.max(originalSize * 1.5, 50),
                                itemStyle: {
                                    borderColor: '#ff6b6b',
                                    borderWidth: 3
                                }
                            };
                        }
                        return n;
                    })
                }]
            });
            
            // 3秒后恢复原样
            setTimeout(() => {
                const currentOption2 = currentChart.getOption();
                if (currentOption2 && currentOption2.series && currentOption2.series[0]) {
                    const nodes2 = currentOption2.series[0].data;
                    const nodeIndex2 = nodes2.findIndex(n => n.id === nodeId);
                    if (nodeIndex2 >= 0) {
                        nodes2[nodeIndex2].symbolSize = originalSize;
                        nodes2[nodeIndex2].itemStyle = {};
                        currentChart.setOption({
                            series: [{
                                data: nodes2
                            }]
                        });
                    }
                }
            }, 3000);
        }
    }
}

// 高亮选中的节点
function highlightSelectedNodes(chart) {
    if (!chart || selectedNodes.length === 0) return;
    
    const currentOption = chart.getOption();
    if (!currentOption || !currentOption.series || !currentOption.series[0]) return;
    
    const nodes = currentOption.series[0].data;
    const selectedIndices = [];
    
    selectedNodes.forEach(selected => {
        const nodeIndex = nodes.findIndex(n => n.id === selected.id);
        if (nodeIndex >= 0) {
            selectedIndices.push(nodeIndex);
        }
    });
    
    // 先取消所有高亮
    chart.dispatchAction({ type: 'downplay' });
    
    // 高亮选中的节点
    selectedIndices.forEach(index => {
        chart.dispatchAction({
            type: 'highlight',
            seriesIndex: 0,
            dataIndex: index
        });
    });
}

// 更新关系显示
function updateRelationshipDisplay() {
    const relationshipDisplay = document.getElementById('relationship-display');
    const relationshipContent = document.getElementById('relationship-content');
    
    if (!relationshipDisplay || !relationshipContent) return;
    
    if (selectedNodes.length === 0) {
        relationshipDisplay.style.display = 'none';
        return;
    }
    
    relationshipDisplay.style.display = 'block';
    
    if (selectedNodes.length === 1) {
        relationshipContent.innerHTML = `
            <div style="color: #666;">
                已选择：<strong style="color: #667eea;">${selectedNodes[0].name}</strong><br>
                <span style="font-size: 0.9em;">请再双击另一个节点查看它们之间的关系</span>
            </div>
        `;
        return;
    }
    
    // 两个节点都已选中，查找它们之间的关系
    const node1 = selectedNodes[0];
    const node2 = selectedNodes[1];
    
    if (!allNetworkData) return;
    
    // 查找关系（考虑双向）
    const relationship = allNetworkData.links.find(link => 
        (link.source === node1.id && link.target === node2.id) ||
        (link.source === node2.id && link.target === node1.id)
    );
    
    if (relationship) {
        const relationType = relationship.relation || '关联';
        
        relationshipContent.innerHTML = `
            <div style="line-height: 2;">
                <div style="margin-bottom: 0.5rem;">
                    <strong style="color: #667eea; font-size: 1.1em;">${node1.name}</strong> 
                    <span style="color: #999;">↔</span> 
                    <strong style="color: #667eea; font-size: 1.1em;">${node2.name}</strong>
                </div>
                <div style="background: white; padding: 0.75rem; border-radius: 4px; margin-top: 0.5rem;">
                    <div><strong>关系类型：</strong><span style="color: #667eea;">${relationType}</span></div>
                </div>
            </div>
        `;
    } else {
        relationshipContent.innerHTML = `
            <div style="color: #e74c3c; line-height: 2;">
                <strong>${node1.name}</strong> 和 <strong>${node2.name}</strong> 之间没有直接关系
            </div>
        `;
    }
}