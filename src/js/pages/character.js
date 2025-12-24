// character.js - 人物特征分析（修复版）

(function () {
    'use strict';

    // 模块配置
    const CONFIG = {
        colors: {
            origin: ['#5470c6', '#91cc75', '#fac858'],
            ending: ['#ee6666', '#73c0de', '#3ba272'],
            sect: ['#73c0de', '#91cc75'],
            frequency: ['#73c0de', '#91cc75']
        },
        dataPath: '/src/data/characters.json',
        chart: {
            height: {
                pie: 400,
                bar: 450,
                line: 500
            }
        }
    };

    let state = {
        data: null,
        charts: {},
        isInitialized: false
    };

    let domCache = {};
    // 修复图表显示的核心函数
    function ensureChartDisplay() {
        // 强制设置所有图表容器的尺寸
        const chartElements = [
            'demon-origin-chart',
            'demon-ending-chart',
            'deity-sect-chart',
            'sect-frequency-chart'
        ];

        chartElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.width = '100%';
                element.style.height = '400px';
                element.style.minHeight = '400px';
                element.style.display = 'block';
            }
        });

        // 强制触发一次resize事件
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 50);
    }
    // 初始化模块
    // 初始化模块
    function init() {
        console.log('初始化人物特征分析模块...');

        // 修复图表显示问题：强制设置容器尺寸
        ensureChartDisplay();
        // 缓存DOM元素
        cacheDOM();

        // 加载数据
        loadData()
            .then(data => {
                state.data = data;
                // 先强制设置容器尺寸
                setChartContainerSizes();

                // 延迟初始化图表，确保DOM已渲染
                setTimeout(() => {
                    initCharts();
                    addInteractions();
                    updateSummary();

                    // 标记已初始化
                    state.isInitialized = true;

                    // 确保图表resize
                    setTimeout(() => {
                        forceChartsResize();
                    }, 100);
                }, 50);
            })
            .catch(error => {
                console.error('数据加载失败:', error);
                showError('人物数据加载失败，请检查数据文件');
            });

        // 添加窗口resize监听
        window.addEventListener('resize', handleWindowResize);
    }

    // 修复：先强制设置图表容器尺寸
    function setChartContainerSizes() {
        const chartWrappers = document.querySelectorAll('.chart-wrapper');
        chartWrappers.forEach(wrapper => {
            wrapper.style.height = '400px';
            wrapper.style.width = '100%';
            wrapper.style.minHeight = '300px';
        });
    }

    function forceChartsResize() {
        Object.values(state.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    function handleWindowResize() {
        if (!state.isInitialized) return;

        Object.values(state.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }

    function cacheDOM() {
        domCache = {
            demonOriginChart: document.getElementById('demon-origin-chart'),
            demonEndingChart: document.getElementById('demon-ending-chart'),
            deitySectChart: document.getElementById('deity-sect-chart'),
            characterPage: document.getElementById('character')
        };
    }

    async function loadData() {
        try {
            const response = await fetch(CONFIG.dataPath);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('数据加载失败:', error);
            throw error;
        }
    }

    function initCharts() {
        if (!state.data) return;

        // 初始化所有图表
        createDemonOriginChart();
        createDemonEndingChart();
        createDeitySectChart();
        createSectFrequencyChart();
    }

    // 1. 妖怪来历分布饼图（修改：点击后显示下方卡片）
    function createDemonOriginChart() {
        if (!state.data?.demons) return;

        const originCount = state.data.demons.reduce((acc, demon) => {
            acc[demon.origin] = (acc[demon.origin] || 0) + 1;
            return acc;
        }, {});

        const chart = echarts.init(domCache.demonOriginChart);

        const option = {
            color: CONFIG.colors.origin,
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ddd',
                borderWidth: 1,
                formatter: function (params) {
                    const total = state.data.demons.length;
                    const demons = state.data.demons.filter(d => d.origin === params.name);
                    const examples = demons.slice(0, 3).map(d => d.name).join('、');

                    return `
                        <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
                        <div>数量: ${params.value} (${params.percent}%)</div>
                        <div>总妖怪数: ${total}</div>
                        <div style="margin-top: 6px; color: #666;">
                            代表: ${examples}${demons.length > 3 ? '等' : ''}
                        </div>
                    `;
                }
            },
            legend: {
                orient: 'vertical',
                right: 20,
                top: 'middle',
                textStyle: { fontSize: 12, color: '#666' },
                itemWidth: 12,
                itemHeight: 12,
                itemGap: 8
            },
            series: [{
                name: '妖怪来历',
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12
                },
                labelLine: {
                    length: 15,
                    length2: 10,
                    smooth: true
                },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold' }
                },
                data: Object.entries(originCount).map(([name, value]) => ({
                    name, value
                }))
            }]
        };

        chart.setOption(option);
        state.charts.demonOrigin = chart;

        // 点击事件：在下方显示卡片
        chart.on('click', function (params) {
            showDemonOriginCard(params.name);
        });
    }

    // 显示妖怪来历卡片（下方显示）
    function showDemonOriginCard(origin) {
        const demons = state.data.demons.filter(d => d.origin === origin);
        const count = demons.length;
        const total = state.data.demons.length;
        const examples = demons.slice(0, 5).map(d => d.name).join('、');

        // 创建或更新卡片
        let card = document.getElementById('origin-detail-card');
        if (!card) {
            card = document.createElement('div');
            card.id = 'origin-detail-card';
            card.className = 'detail-card';

            // 插入到妖怪来历图表容器后面
            const originContainer = domCache.demonOriginChart.closest('.chart-container');
            originContainer.parentNode.insertBefore(card, originContainer.nextSibling);
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">${origin}妖怪详情</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">
                    ×
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">总数</div>
                    <div style="font-size: 2rem; font-weight: bold; color: ${CONFIG.colors.origin[0]};">${count}</div>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">占比</div>
                    <div style="font-size: 2rem; font-weight: bold; color: ${CONFIG.colors.origin[1]};">${(count / total * 100).toFixed(1)}%</div>
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">代表性妖怪</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${demons.slice(0, 8).map(demon => `
                        <span style="background: #e9ecef; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; color: #495057;">
                            ${demon.name}
                        </span>
                    `).join('')}
                    ${demons.length > 8 ? `<span style="color: #666; font-size: 0.9rem; align-self: center;">等${demons.length - 8}个</span>` : ''}
                </div>
            </div>
            <div>
                <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">特点分析</div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; color: #666;">
                    ${getOriginAnalysis(origin)}
                </div>
            </div>
        `;

        card.style.display = 'block';
    }

    // 2. 妖怪结局分布饼图（修改：点击后显示下方卡片）
    function createDemonEndingChart() {
        if (!state.data?.demons) return;

        const endingCount = state.data.demons.reduce((acc, demon) => {
            acc[demon.ending] = (acc[demon.ending] || 0) + 1;
            return acc;
        }, {});

        const chart = echarts.init(domCache.demonEndingChart);

        const option = {
            color: CONFIG.colors.ending,
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ddd',
                borderWidth: 1,
                formatter: function (params) {
                    const total = state.data.demons.length;
                    const demons = state.data.demons.filter(d => d.ending === params.name);
                    const examples = demons.slice(0, 3).map(d => d.name).join('、');

                    return `
                        <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
                        <div>数量: ${params.value} (${params.percent}%)</div>
                        <div>总妖怪数: ${total}</div>
                        <div style="margin-top: 6px; color: #666;">
                            代表: ${examples}${demons.length > 3 ? '等' : ''}
                        </div>
                    `;
                }
            },
            legend: {
                orient: 'vertical',
                right: 20,
                top: 'middle',
                textStyle: { fontSize: 12, color: '#666' },
                itemWidth: 12,
                itemHeight: 12,
                itemGap: 8
            },
            series: [{
                name: '妖怪结局',
                type: 'pie',
                radius: ['45%', '70%'],
                center: ['40%', '50%'],
                roseType: 'radius',
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 6,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12
                },
                labelLine: {
                    length: 15,
                    length2: 10,
                    smooth: true
                },
                emphasis: {
                    label: { show: true, fontSize: 14, fontWeight: 'bold' }
                },
                data: Object.entries(endingCount).map(([name, value]) => ({
                    name, value
                }))
            }]
        };

        chart.setOption(option);
        state.charts.demonEnding = chart;

        // 点击事件：在下方显示卡片
        chart.on('click', function (params) {
            showDemonEndingCard(params.name);
        });
    }

    // 显示妖怪结局卡片（下方显示）
    function showDemonEndingCard(ending) {
        const demons = state.data.demons.filter(d => d.ending === ending);
        const count = demons.length;
        const total = state.data.demons.length;
        const examples = demons.slice(0, 5).map(d => d.name).join('、');

        // 创建或更新卡片
        let card = document.getElementById('ending-detail-card');
        if (!card) {
            card = document.createElement('div');
            card.id = 'ending-detail-card';
            card.className = 'detail-card';

            // 插入到妖怪结局图表容器后面
            const endingContainer = domCache.demonEndingChart.closest('.chart-container');
            endingContainer.parentNode.insertBefore(card, endingContainer.nextSibling);
        }

        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h4 style="margin: 0; color: #333;">${ending}分析</h4>
                <button onclick="this.parentElement.parentElement.style.display='none'" 
                        style="background: none; border: none; font-size: 1.2rem; cursor: pointer; color: #999;">
                    ×
                </button>
            </div>
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">总数</div>
                    <div style="font-size: 2rem; font-weight: bold; color: ${CONFIG.colors.ending[0]};">${count}</div>
                </div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px;">
                    <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">占比</div>
                    <div style="font-size: 2rem; font-weight: bold; color: ${CONFIG.colors.ending[1]};">${(count / total * 100).toFixed(1)}%</div>
                </div>
            </div>
            <div style="margin-bottom: 1rem;">
                <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">代表性妖怪</div>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
                    ${demons.slice(0, 8).map(demon => `
                        <span style="background: #e9ecef; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.9rem; color: #495057;">
                            ${demon.name}
                        </span>
                    `).join('')}
                    ${demons.length > 8 ? `<span style="color: #666; font-size: 0.9rem; align-self: center;">等${demons.length - 8}个</span>` : ''}
                </div>
            </div>
            <div>
                <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">特点分析</div>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; color: #666;">
                    ${getEndingAnalysis(ending)}
                </div>
            </div>
        `;

        card.style.display = 'block';
    }

    // 3. 增强版神仙派系对比柱状图
    function createDeitySectChart() {
        if (!state.data?.deities) return;

        // 准备数据：所有神仙按出场次数排序
        const deitiesData = state.data.deities
            .filter(deity => deity.name !== "唐三藏" && deity.name !== "唐僧") // 避免重复
            .map(deity => ({
                name: deity.name,
                sect: deity.sect,
                appearances: deity.appearances ? deity.appearances.length : 0,
                appearancesList: deity.appearances || [],
                role: deity.role || '',
                description: deity.description || ''
            }))
            .sort((a, b) => b.appearances - a.appearances)
            .slice(0, 20); // 只显示前20个

        const chart = echarts.init(domCache.deitySectChart);

        const option = {
            color: CONFIG.colors.sect,
            backgroundColor: 'transparent',
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                borderColor: '#ddd',
                borderWidth: 1,
                formatter: function (params) {
                    const deity = deitiesData[params[0].dataIndex];
                    return `
                        <div style="font-weight: bold; margin-bottom: 8px;">${deity.name}</div>
                        <div style="color: ${deity.sect === '道教' ? CONFIG.colors.sect[0] : CONFIG.colors.sect[1]}">
                            派系: ${deity.sect}
                        </div>
                        <div>出场次数: ${deity.appearances}</div>
                        <div>角色: ${deity.role}</div>
                    `;
                }
            },
            grid: {
                left: '3%',
                right: '5%',
                bottom: '15%',
                top: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: deitiesData.map(d => d.name),
                axisLabel: {
                    rotate: 45,
                    fontSize: 11,
                    interval: 0,
                    formatter: function (value) {
                        return value.length > 4 ? value.substring(0, 4) + '..' : value;
                    }
                },
                axisLine: {
                    lineStyle: { color: '#ddd' }
                }
            },
            yAxis: {
                type: 'value',
                name: '出场次数',
                nameTextStyle: { fontSize: 12 },
                axisLine: {
                    lineStyle: { color: '#ddd' }
                },
                splitLine: {
                    lineStyle: { color: '#f0f0f0' }
                }
            },
            series: [{
                name: '出场次数',
                type: 'bar',
                data: deitiesData.map(deity => ({
                    value: deity.appearances,
                    itemStyle: {
                        color: deity.sect === '道教' ? CONFIG.colors.sect[0] : CONFIG.colors.sect[1],
                        borderRadius: [3, 3, 0, 0]
                    }
                })),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    fontSize: 11
                },
                barWidth: '60%',
                itemStyle: {
                    borderWidth: 1,
                    borderColor: '#fff'
                }
            }],
            dataZoom: [
                {
                    type: 'inside',
                    start: 0,
                    end: 100
                },
                {
                    show: true,
                    type: 'slider',
                    bottom: 25,
                    start: 0,
                    end: 100,
                    height: 20,
                    borderColor: '#ddd',
                    fillerColor: 'rgba(115, 192, 222, 0.2)'
                }
            ]
        };

        chart.setOption(option);
        state.charts.deitySect = chart;

        // 添加点击事件：显示神仙详情模态框
        chart.on('click', function (params) {
            const deity = deitiesData[params.dataIndex];
            showDeityModal(deity);
        });
    }

    // 显示神仙详情模态框
    function showDeityModal(deity) {
        // 创建模态框
        const modal = document.createElement('div');
        modal.id = 'deity-modal';
        modal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            z-index: 1000;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
        `;

        // 创建遮罩层
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 999;
        `;

        overlay.onclick = () => {
            modal.remove();
            overlay.remove();
        };

        // 计算出场章节统计
        const appearances = deity.appearancesList || [];
        const firstAppearance = appearances.length > 0 ? Math.min(...appearances) : 0;
        const lastAppearance = appearances.length > 0 ? Math.max(...appearances) : 0;

        modal.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #333;">${deity.name}</h3>
                <button onclick="this.closest('#deity-modal').remove(); 
                                document.querySelector('.modal-overlay')?.remove();" 
                        style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">
                    ×
                </button>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 1.5rem;">
                <div style="width: 12px; height: 12px; background: ${deity.sect === '道教' ? CONFIG.colors.sect[0] : CONFIG.colors.sect[1]}; 
                     border-radius: 50%; margin-right: 8px;"></div>
                <span style="color: #666; font-weight: 500;">${deity.sect}</span>
            </div>
            
            <div style="margin-bottom: 1.5rem;">
                <h4 style="margin: 0 0 1rem 0; color: #555;">出场统计</h4>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">出场次数</div>
                        <div style="font-size: 1.75rem; font-weight: bold; color: #333;">${deity.appearances}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">首次出场</div>
                        <div style="font-size: 1.75rem; font-weight: bold; color: #333;">${firstAppearance > 0 ? `第${firstAppearance}回` : '无'}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; text-align: center;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">最后出场</div>
                        <div style="font-size: 1.75rem; font-weight: bold; color: #333;">${lastAppearance > 0 ? `第${lastAppearance}回` : '无'}</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: ${appearances.length > 0 ? '1.5rem' : '0'}">
                <h4 style="margin: 0 0 1rem 0; color: #555;">角色信息</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; color: #666; line-height: 1.6;">
                    <div style="margin-bottom: 0.5rem;"><strong>角色：</strong>${deity.role}</div>
                    <div><strong>描述：</strong>${deity.description}</div>
                </div>
            </div>
            
            ${appearances.length > 0 ? `
            <div>
                <h4 style="margin: 0 0 1rem 0; color: #555;">出场章节 (${appearances.length}个)</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; max-height: 200px; overflow-y: auto;">
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${appearances.map(chap => `
                            <span style="background: white; padding: 6px 10px; border-radius: 6px; font-size: 0.9rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                第${chap}回
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(modal);
    }

    // 4. 派系出现频率变化图
    function createSectFrequencyChart() {
        if (!state.data?.sectFrequency?.data) return;

        // 创建容器
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0; color: #333;">神仙派系出现频率变化（按章节）</h3>
                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
                    展示道教和佛教神仙在各章节的出现次数变化趋势
                </p>
            </div>
            <div id="sect-frequency-chart" class="chart-wrapper" style="height: 500px; padding: 1rem;"></div>
        `;

        // 插入位置
        const deitySectContainer = domCache.deitySectChart.closest('.chart-container');
        deitySectContainer.parentNode.insertBefore(container, deitySectContainer.nextSibling);

        // 延迟初始化
        setTimeout(() => {
            const chartDom = document.getElementById('sect-frequency-chart');
            if (!chartDom) return;

            const chart = echarts.init(chartDom);
            const freqData = state.data.sectFrequency.data;

            const chapters = freqData.map(d => `第${d.chapter}回`);
            const taoistData = freqData.map(d => d.道教);
            const buddhistData = freqData.map(d => d.佛教);

            const option = {
                color: CONFIG.colors.frequency,
                backgroundColor: 'transparent',
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    borderColor: '#ddd',
                    borderWidth: 1,
                    formatter: function (params) {
                        const chapter = params[0].axisValue;
                        const taoist = params[0].value;
                        const buddhist = params[1].value;
                        const total = taoist + buddhist;

                        return `
                            <div style="font-weight: bold; margin-bottom: 8px;">${chapter}</div>
                            <div style="color: ${CONFIG.colors.frequency[0]}">道教: ${taoist}次 ${total > 0 ? `(${(taoist / total * 100).toFixed(1)}%)` : ''}</div>
                            <div style="color: ${CONFIG.colors.frequency[1]}">佛教: ${buddhist}次 ${total > 0 ? `(${(buddhist / total * 100).toFixed(1)}%)` : ''}</div>
                            <div style="margin-top: 6px; color: #666;">总计: ${total}次</div>
                        `;
                    }
                },
                legend: {
                    data: ['道教', '佛教'],
                    top: 10,
                    textStyle: { fontSize: 12 }
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    top: '18%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chapters,
                    axisLabel: {
                        rotate: 45,
                        fontSize: 11,
                        interval: function (index) {
                            return index % 10 === 0;
                        }
                    },
                    axisLine: {
                        lineStyle: { color: '#ddd' }
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '出现次数',
                    nameTextStyle: { fontSize: 12 },
                    axisLine: {
                        lineStyle: { color: '#ddd' }
                    },
                    splitLine: {
                        lineStyle: { color: '#f0f0f0' }
                    }
                },
                series: [
                    {
                        name: '道教',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { width: 3 },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(115, 192, 222, 0.4)' },
                                { offset: 1, color: 'rgba(115, 192, 222, 0.1)' }
                            ])
                        },
                        data: taoistData
                    },
                    {
                        name: '佛教',
                        type: 'line',
                        smooth: true,
                        symbol: 'circle',
                        symbolSize: 6,
                        lineStyle: { width: 3 },
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(145, 204, 117, 0.4)' },
                                { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
                            ])
                        },
                        data: buddhistData
                    }
                ],
                dataZoom: [
                    {
                        type: 'inside',
                        start: 0,
                        end: 100
                    },
                    {
                        show: true,
                        type: 'slider',
                        bottom: 25,
                        start: 0,
                        end: 100,
                        height: 20,
                        borderColor: '#ddd',
                        fillerColor: 'rgba(115, 192, 222, 0.2)'
                    }
                ]
            };

            chart.setOption(option);
            state.charts.sectFrequency = chart;
        }, 100);
    }

    // 辅助函数
    function getOriginAnalysis(origin) {
        const analysis = {
            "天庭下凡": "多为神仙的坐骑、童子或宠物下凡为妖，通常有强大的后台和法宝，结局多被神仙带回。如来佛祖、观音菩萨等佛教神仙的坐骑也归为此类。",
            "本土成精": "由动物、植物或物品修炼成精，通常无后台，结局多被击杀或收服。这些妖怪多靠自身修炼获得法力，如白骨精、红孩儿等。",
            "其他": "包括一些特殊的妖怪，如六耳猕猴等，难以简单分类。这类妖怪通常有特殊能力或身份。"
        };
        return analysis[origin] || '暂无分析';
    }

    function getEndingAnalysis(ending) {
        const analyses = {
            "被击杀": "多为无后台的本土妖怪，或罪大恶极者。这些妖怪通常没有强大的后台支持，如白骨精、蟒蛇精等。",
            "被收服": "多为有潜力或被点化的妖怪，如红孩儿被观音收为善财童子，黑熊精被收为守山大神等。",
            "被神仙带回": "多为有后台的妖怪（童子、坐骑等），如金角银角大王、青牛精、黄袍怪等。这些妖怪多被原来的主人带回。",
            "被击败": "被孙悟空等击败但未被杀，如如意真仙等。",
            "被击退": "被击退但未被消灭，如寅将军、熊山君等。"
        };
        return analyses[ending] || "暂无分析";
    }

    // 添加交互功能
    function addInteractions() {
        // 饼图点击事件已在各自函数中绑定
    }

    // 更新数据摘要
    function updateSummary() {
        if (!state.data) return;

        const demons = state.data.demons;
        const deities = state.data.deities;

        // 计算统计数据
        const originCounts = demons.reduce((acc, d) => {
            acc[d.origin] = (acc[d.origin] || 0) + 1;
            return acc;
        }, {});

        const endingCounts = demons.reduce((acc, d) => {
            acc[d.ending] = (acc[d.ending] || 0) + 1;
            return acc;
        }, {});

        const sectCounts = deities.reduce((acc, d) => {
            acc[d.sect] = (acc[d.sect] || 0) + 1;
            return acc;
        }, {});

        // 更新数据说明卡片
        const dataCard = domCache.characterPage?.querySelector('.card:first-of-type');
        if (dataCard) {
            dataCard.innerHTML = `
                <h4 style="margin: 0 0 1rem 0; color: #333;">📊 数据统计</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1rem;">
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">妖怪总数</div>
                        <div style="font-size: 1.75rem; font-weight: bold; color: #333;">${demons.length}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px;">
                        <div style="font-size: 0.9rem; color: #666; margin-bottom: 0.5rem;">神仙总数</div>
                        <div style="font-size: 1.75rem; font-weight: bold; color: #333;">${deities.length}</div>
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">妖怪来历分布</div>
                    <ul style="margin: 0 0 0 1rem; padding: 0; color: #666;">
                        ${Object.entries(originCounts).map(([origin, count]) => `
                            <li style="margin-bottom: 0.25rem;">${origin}: ${count} (${(count / demons.length * 100).toFixed(1)}%)</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div>
                    <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">神仙派系分布</div>
                    <ul style="margin: 0 0 0 1rem; padding: 0; color: #666;">
                        ${Object.entries(sectCounts).map(([sect, count]) => `
                            <li style="margin-bottom: 0.25rem;">${sect}: ${count} (${(count / deities.length * 100).toFixed(1)}%)</li>
                        `).join('')}
                    </ul>
                </div>
            `;
        }

        // 更新分析视角卡片
        const analysisCard = domCache.characterPage?.querySelector('.card:last-of-type');
        if (analysisCard) {
            analysisCard.innerHTML = `
                <h4 style="margin: 0 0 1rem 0; color: #333;">🔍 分析视角</h4>
                <div style="color: #666; line-height: 1.6; margin-bottom: 1rem;">
                    <p>通过饼图、柱状图和折线图多维展示《西游记》中人物的特征分布和变化趋势。</p>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <div style="font-weight: 500; margin-bottom: 0.5rem; color: #555;">使用说明</div>
                    <ul style="margin: 0 0 0 1rem; padding: 0; color: #666; font-size: 0.9rem;">
                        <li style="margin-bottom: 0.25rem;">点击饼图扇区查看妖怪分类详情</li>
                        <li style="margin-bottom: 0.25rem;">点击柱状图查看神仙出场详情</li>
                        <li style="margin-bottom: 0.25rem;">使用滑块查看完整数据</li>
                    </ul>
                </div>
                
                <div style="color: #666; font-size: 0.9rem; font-style: italic; border-left: 3px solid #667eea; padding-left: 0.75rem;">
                    提示：天庭下凡的妖怪占比高，反映了《西游记》中"有后台的妖怪不会被杀"的现象。
                </div>
            `;
        }
    }

    function showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #fff2f2;
            border: 1px solid #ffcccc;
            border-radius: 6px;
            padding: 1rem;
            margin: 1rem;
            color: #cc3333;
        `;
        errorDiv.innerHTML = `<strong>错误：</strong> ${message}`;

        if (domCache.characterPage) {
            domCache.characterPage.insertBefore(errorDiv, domCache.characterPage.firstChild);
        }
    }

    // 公开API
    window.CharacterModule = {
        init: init,
        refresh: function () {
            Object.values(state.charts).forEach(chart => {
                if (chart && typeof chart.dispose === 'function') {
                    chart.dispose();
                }
            });
            state.charts = {};
            state.isInitialized = false;
            init();
        }
    };

    // 自动初始化
    // 👇 关键：只在 pageLoaded 事件触发且是 character 页面时 init
    window.addEventListener('pageLoaded', (e) => {
        const currentPage = e.detail.page;

        if (currentPage === 'character') {
            // 进入页面：初始化
            init();
        } else {
            // 离开页面：销毁（如果之前初始化过）
            if (state.isInitialized) {
                const page = document.getElementById('character');
                if (page) {
                    // 移除你之前强制设置的内联样式
                    // page.style.display = '';
                    // page.style.opacity = '';
                    // page.style.visibility = '';
                }
            }
        }
    });
})();