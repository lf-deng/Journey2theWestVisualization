// character.js - 人物特征分析（增强版）
(function() {
    'use strict';
    
    // 模块配置
    const CONFIG = {
        colors: {
            origin: ['#5470c6', '#91cc75', '#fac858'],
            ending: ['#ee6666', '#73c0de', '#3ba272'],
            sect: ['#73c0de', '#91cc75'],
            frequency: ['#73c0de', '#91cc75']
        },
        dataPath: '../data/characters.json',
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
        isResized: false
    };
    
    let domCache = {};
    
    // 初始化模块
    function init() {
        console.log('初始化人物特征分析模块...');
        
        // 缓存DOM元素
        cacheDOM();
        
        // 加载数据
        loadData()
            .then(data => {
                state.data = data;
                console.log('数据加载成功:', data.metadata);
                
                // 修复图表显示问题：延迟初始化
                setTimeout(() => {
                    initCharts();
                    addInteractions();
                    updateSummary();
                    // 初始化后强制resize一次
                    forceChartsResize();
                }, 100);
            })
            .catch(error => {
                console.error('数据加载失败:', error);
                showError('人物数据加载失败，请检查数据文件');
            });
        
        // 添加窗口resize监听
        window.addEventListener('resize', handleWindowResize);
    }
    
    // 修复图表显示问题：强制resize所有图表
    function forceChartsResize() {
        if (!state.isResized) {
            Object.values(state.charts).forEach(chart => {
                if (chart && typeof chart.resize === 'function') {
                    chart.resize();
                }
            });
            state.isResized = true;
        }
    }
    
    function handleWindowResize() {
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
        
        // 创建图表（使用真实数据）
        createDemonOriginChart();
        createDemonEndingChart();
        createDeitySectChart(); // 增强的柱状图
        createSectFrequencyChart();
    }
    
    // 1. 妖怪来历分布饼图
    function createDemonOriginChart() {
        if (!state.data?.demons) return;
        
        const originCount = state.data.demons.reduce((acc, demon) => {
            acc[demon.origin] = (acc[demon.origin] || 0) + 1;
            return acc;
        }, {});
        
        const chart = echarts.init(domCache.demonOriginChart);
        
        const option = {
            color: CONFIG.colors.origin,
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const total = state.data.demons.length;
                    const percent = params.percent;
                    const demons = state.data.demons.filter(d => d.origin === params.name);
                    const examples = demons.slice(0, 3).map(d => d.name).join('、');
                    
                    return `
                        <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
                        <div>数量: ${params.value} (${percent}%)</div>
                        <div>占比: ${(params.value/total*100).toFixed(1)}%</div>
                        <div style="margin-top: 6px; color: #666;">
                            代表性妖怪: ${examples}${demons.length > 3 ? '等' : ''}
                        </div>
                    `;
                }
            },
            legend: {
                orient: 'vertical',
                right: 20,
                top: 'middle',
                textStyle: { fontSize: 12 }
            },
            series: [{
                name: '妖怪来历',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12
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
    }
    
    // 2. 妖怪结局分布饼图
    function createDemonEndingChart() {
        if (!state.data?.demons) return;
        
        const endingCount = state.data.demons.reduce((acc, demon) => {
            acc[demon.ending] = (acc[demon.ending] || 0) + 1;
            return acc;
        }, {});
        
        const chart = echarts.init(domCache.demonEndingChart);
        
        const option = {
            color: CONFIG.colors.ending,
            tooltip: {
                trigger: 'item',
                formatter: function(params) {
                    const total = state.data.demons.length;
                    const demons = state.data.demons.filter(d => d.ending === params.name);
                    const examples = demons.slice(0, 3).map(d => d.name).join('、');
                    
                    return `
                        <div style="font-weight: bold; margin-bottom: 8px;">${params.name}</div>
                        <div>数量: ${params.value} (${params.percent}%)</div>
                        <div>占比: ${(params.value/total*100).toFixed(1)}%</div>
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
                textStyle: { fontSize: 12 }
            },
            series: [{
                name: '妖怪结局',
                type: 'pie',
                radius: ['40%', '70%'],
                center: ['40%', '50%'],
                roseType: 'area',
                itemStyle: {
                    borderRadius: 8,
                    borderColor: '#fff',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    formatter: '{b}\n{c} ({d}%)',
                    fontSize: 12
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
    }
    
    // 3. 增强版神仙派系对比柱状图 - 显示每个神仙出场次数
    function createDeitySectChart() {
        if (!state.data?.deities) return;
        
        // 准备数据：所有神仙按出场次数排序
        const deitiesData = state.data.deities
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
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                },
                formatter: function(params) {
                    const deity = deitiesData[params[0].dataIndex];
                    return `
                        <div style="font-weight: bold; margin-bottom: 6px;">${deity.name}</div>
                        <div>派系: ${deity.sect}</div>
                        <div>出场次数: ${deity.appearances}</div>
                        <div>角色: ${deity.role}</div>
                        <div style="margin-top: 6px; color: #666; font-size: 12px;">
                            ${deity.description}
                        </div>
                    `;
                }
            },
            grid: {
                left: '3%',
                right: '8%',
                bottom: '10%',
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
                    formatter: function(value) {
                        return value.length > 4 ? value.substring(0, 3) + '..' : value;
                    }
                }
            },
            yAxis: {
                type: 'value',
                name: '出场次数',
                nameTextStyle: { fontSize: 12 }
            },
            series: [{
                name: '出场次数',
                type: 'bar',
                data: deitiesData.map(deity => ({
                    value: deity.appearances,
                    itemStyle: {
                        color: deity.sect === '道教' ? CONFIG.colors.sect[0] : CONFIG.colors.sect[1]
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
                    borderRadius: [4, 4, 0, 0]
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
                    bottom: 20,
                    start: 0,
                    end: 100,
                    height: 20
                }
            ]
        };
        
        chart.setOption(option);
        state.charts.deitySect = chart;
        
        // 添加点击事件
        chart.on('click', function(params) {
            const deity = deitiesData[params.dataIndex];
            showDeityDetails(deity);
        });
    }
    
    // 4. 派系出现频率变化图
    function createSectFrequencyChart() {
        if (!state.data?.sectFrequency?.data) return;
        
        // 创建容器
        const container = document.createElement('div');
        container.className = 'chart-container';
        container.innerHTML = `
            <div style="padding: 1rem; border-bottom: 1px solid #eee;">
                <h3 style="margin: 0;">神仙派系出现频率变化（按章节）</h3>
                <p style="margin: 0.5rem 0 0 0; color: #666; font-size: 0.9rem;">
                    展示道教和佛教神仙在各章节的出现次数变化
                </p>
            </div>
            <div id="sect-frequency-chart" style="height: ${CONFIG.chart.height.line}px; padding: 1rem;"></div>
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
                tooltip: {
                    trigger: 'axis',
                    axisPointer: { type: 'cross' },
                    formatter: function(params) {
                        const chapter = params[0].axisValue;
                        const taoist = params[0].value;
                        const buddhist = params[1].value;
                        const total = taoist + buddhist;
                        
                        return `
                            <div style="font-weight: bold; margin-bottom: 5px;">${chapter}</div>
                            <div style="color: ${CONFIG.colors.frequency[0]}">道教: ${taoist}次 (${total > 0 ? (taoist/total*100).toFixed(1) : 0}%)</div>
                            <div style="color: ${CONFIG.colors.frequency[1]}">佛教: ${buddhist}次 (${total > 0 ? (buddhist/total*100).toFixed(1) : 0}%)</div>
                        `;
                    }
                },
                legend: {
                    data: ['道教', '佛教'],
                    top: 10
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '15%',
                    top: '20%',
                    containLabel: true
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: chapters,
                    axisLabel: {
                        rotate: 45,
                        interval: function(index) {
                            return index % 10 === 0;
                        },
                        fontSize: 11
                    }
                },
                yAxis: {
                    type: 'value',
                    name: '出现次数'
                },
                series: [
                    {
                        name: '道教',
                        type: 'line',
                        smooth: true,
                        data: taoistData,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(115, 192, 222, 0.6)' },
                                { offset: 1, color: 'rgba(115, 192, 222, 0.1)' }
                            ])
                        },
                        lineStyle: { width: 3 }
                    },
                    {
                        name: '佛教',
                        type: 'line',
                        smooth: true,
                        data: buddhistData,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: 'rgba(145, 204, 117, 0.6)' },
                                { offset: 1, color: 'rgba(145, 204, 117, 0.1)' }
                            ])
                        },
                        lineStyle: { width: 3 }
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
                        top: '90%',
                        start: 0,
                        end: 100,
                        height: 20
                    }
                ]
            };
            
            chart.setOption(option);
            state.charts.sectFrequency = chart;
        }, 150);
    }
    
    // 显示神仙详情
    function showDeityDetails(deity) {
        // 创建或更新详情卡片
        let detailCard = document.getElementById('deity-detail-card');
        if (!detailCard) {
            detailCard = document.createElement('div');
            detailCard.id = 'deity-detail-card';
            detailCard.className = 'detail-card';
            detailCard.style.cssText = `
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
                max-height: 80vh;
                overflow-y: auto;
            `;
            document.body.appendChild(detailCard);
            
            // 添加背景遮罩
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
                detailCard.remove();
                overlay.remove();
            };
            document.body.appendChild(overlay);
        }
        
        // 计算出场章节统计
        const appearances = deity.appearancesList || [];
        const firstAppearance = Math.min(...appearances);
        const lastAppearance = Math.max(...appearances);
        
        detailCard.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                <h3 style="margin: 0; color: #333;">${deity.name}</h3>
                <button onclick="this.closest('.detail-card').remove(); 
                                document.querySelector('.modal-overlay')?.remove();" 
                        style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">
                    ×
                </button>
            </div>
            
            <div style="display: flex; align-items: center; margin-bottom: 1rem;">
                <div style="width: 12px; height: 12px; background: ${deity.sect === '道教' ? CONFIG.colors.sect[0] : CONFIG.colors.sect[1]}; 
                     border-radius: 50%; margin-right: 8px;"></div>
                <span style="color: #666;">${deity.sect}</span>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #555;">出场统计</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem;">
                    <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 6px;">
                        <div style="font-size: 0.9rem; color: #666;">出场次数</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #333;">${deity.appearances}</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 6px;">
                        <div style="font-size: 0.9rem; color: #666;">首次出场</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #333;">第${firstAppearance}回</div>
                    </div>
                    <div style="background: #f8f9fa; padding: 0.75rem; border-radius: 6px;">
                        <div style="font-size: 0.9rem; color: #666;">最后出场</div>
                        <div style="font-size: 1.5rem; font-weight: bold; color: #333;">第${lastAppearance}回</div>
                    </div>
                </div>
            </div>
            
            <div style="margin-bottom: 1rem;">
                <h4 style="margin: 0 0 0.5rem 0; color: #555;">角色信息</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px;">
                    <div style="margin-bottom: 0.5rem;">
                        <strong>角色：</strong>${deity.role}
                    </div>
                    <div>
                        <strong>描述：</strong>${deity.description}
                    </div>
                </div>
            </div>
            
            ${appearances.length > 0 ? `
            <div>
                <h4 style="margin: 0 0 0.5rem 0; color: #555;">出场章节</h4>
                <div style="background: #f8f9fa; padding: 1rem; border-radius: 6px; max-height: 200px; overflow-y: auto;">
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${appearances.map(chap => `
                            <span style="background: white; padding: 4px 8px; border-radius: 4px; font-size: 0.9rem;">
                                第${chap}回
                            </span>
                        `).join('')}
                    </div>
                </div>
            </div>
            ` : ''}
        `;
    }
    
    // 添加交互功能
    function addInteractions() {
        // 饼图点击显示详情
        if (state.charts.demonOrigin) {
            state.charts.demonOrigin.on('click', function(params) {
                const origin = params.name;
                const demons = state.data.demons.filter(d => d.origin === origin);
                const examples = demons.slice(0, 5).map(d => d.name).join('、');
                
                alert(`${origin}妖怪详情\n\n数量：${demons.length}个\n代表：${examples}${demons.length > 5 ? '等' : ''}\n占比：${(demons.length/state.data.demons.length*100).toFixed(1)}%`);
            });
        }
        
        if (state.charts.demonEnding) {
            state.charts.demonEnding.on('click', function(params) {
                const ending = params.name;
                const demons = state.data.demons.filter(d => d.ending === ending);
                const examples = demons.slice(0, 5).map(d => d.name).join('、');
                
                alert(`${ending}详情\n\n数量：${demons.length}个\n代表：${examples}${demons.length > 5 ? '等' : ''}\n占比：${(demons.length/state.data.demons.length*100).toFixed(1)}%`);
            });
        }
    }
    
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
                <h4 style="margin: 0 0 0.75rem 0;">📊 数据统计</h4>
                <p style="margin: 0.5rem 0;"><strong>妖怪总数：</strong> ${demons.length}</p>
                <p style="margin: 0.5rem 0;"><strong>神仙总数：</strong> ${deities.length}</p>
                <p style="margin: 0.5rem 0 0.25rem 0;"><strong>妖怪来历分布：</strong></p>
                <ul style="margin: 0 0 0.5rem 0; padding-left: 1.2rem;">
                    ${Object.entries(originCounts).map(([origin, count]) => `
                        <li>${origin}: ${count} (${(count/demons.length*100).toFixed(1)}%)</li>
                    `).join('')}
                </ul>
                <p style="margin: 0.5rem 0 0.25rem 0;"><strong>神仙派系分布：</strong></p>
                <ul style="margin: 0; padding-left: 1.2rem;">
                    ${Object.entries(sectCounts).map(([sect, count]) => `
                        <li>${sect}: ${count} (${(count/deities.length*100).toFixed(1)}%)</li>
                    `).join('')}
                </ul>
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
        refresh: function() {
            state.isResized = false;
            initCharts();
            forceChartsResize();
        }
    };
    
    // 自动初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 100); // 延迟初始化确保DOM已加载
    }
    
})();