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

const ROUTE_DATA_URL = encodeURI('src/data/取经路线.json');

async function initRouteChart() {
    const containerId = 'route-chart';
    const chart = window.chartManager.initChart(containerId);

    const mapReady = await ensureChinaMapRegistered();
    if (!mapReady) {
        chart.setOption({
            title: {
                text: '地图加载失败，请稍后刷新重试',
                left: 'center',
                top: 'center',
                textStyle: { color: '#fa709a', fontSize: 16 }
            }
        });
        return;
    }
    const routeSource = await loadRouteData();
    if (!routeSource) {
        chart.setOption({
            title: {
                text: '路线数据加载失败，请检查网络或文件路径',
                left: 'center',
                top: 'center',
                textStyle: { color: '#fa709a', fontSize: 16 }
            }
        });
        return;
    }

    const { points, lines, meta } = transformRouteData(routeSource);
    console.log(points)
    if (!points.length) {
        chart.setOption({
            title: {
                text: '暂无可展示的取经路线数据',
                left: 'center',
                top: 'center',
                textStyle: { color: '#fa709a', fontSize: 16 }
            }
        });
        return;
    }

    // 组合地理坐标叠加线图与散点，模拟取经路线巡游
    const option = {
        backgroundColor: '#AAD3DF',
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
                if (params.componentSubType === 'scatter' || params.componentSubType === 'effectScatter') {
                    const data = params.data;
                    // console.log("params", data);
                    const hardshipText = data.hardships && data.hardships.length
                        ? data.hardships.map(h => `第${h.number}难：${h.description}`).join('<br>')
                        : '暂无记录';
                    return [
                        `<strong>${params.name}</strong>`,
                        `${data.description || ''}`,
                        `所属：${data.country}`,
                        `进度：第${data.sequence}站 / 共${meta.totalLocations}站`,
                        `劫难数：${data.hardshipCount}`,
                        hardshipText
                    ].join('<br>');
                }
                if (params.componentSubType === 'lines') {
                    return params.data.tooltip || '取经路线';
                }
                return params.name || '';
            }
        },
        geo: {
            map: 'china',
            roam: true,
            zoom: 1.5,
            center: [105, 36],
            layoutCenter: ['75%', '35%'],
            layoutSize: '145%',

            label: {
                emphasis: {
                    show: false
                }
            },
            itemStyle: {
                normal: {
                    areaColor: '#F7EDD1',
                    borderColor: '#d4b896'
                },
                emphasis: {
                    areaColor: '#BDDAB1'
                }
            }
        },
        series: [
            {
                name: '取经路线',
                type: 'lines',
                coordinateSystem: 'geo',
                zlevel: 1,
                effect: {
                    show: true,
                    period: 4,
                    trailLength: 0.5,
                    color: '#f1c40f', // 金色光点，象征佛光或取经之路
                    symbolSize: 5
                },
                lineStyle: {
                    normal: {
                        // color: '#d35400', // 移除全局颜色，使用数据中的颜色
                        width: 3.34,
                        curveness: 0.0618,
                        opacity: 0.5
                    },
                    emphasis: {
                        width: 4,
                        opacity: 1
                    }
                },
                data: lines
            },
            {
                name: '起点标记',
                type: 'effectScatter',
                coordinateSystem: 'geo',
                zlevel: 2,
                data: points.filter(p => p.isStart),
                symbol: 'pin',
                symbolSize: 35,
                showEffectOn: 'render',
                rippleEffect: {
                    brushType: 'fill',
                    scale: 3,
                    period: 3
                },
                label: {
                    show: true,
                    formatter: '【起点】{b}',
                    position: 'top',
                    backgroundColor: 'rgba(192, 57, 43, 0.9)',
                    padding: [5, 10],
                    borderRadius: 4,
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: 14,
                    shadowBlur: 5,
                    shadowColor: 'rgba(0,0,0,0.3)'
                },
                itemStyle: {
                    color: '#c0392b',
                    shadowBlur: 15,
                    shadowColor: 'rgba(0,0,0,0.5)'
                }
            },
            {
                name: '停留地点',
                type: 'scatter',
                coordinateSystem: 'geo',
                data: points,
                symbolSize: function (val, params) {
                    const count = params.data.hardshipCount || 0;
                    return Math.max(12, 6 + count * 2);
                },
                label: {
                    formatter: '{b}',
                    position: 'right',
                    show: false
                },
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                        { offset: 0, color: '#e74c3c' }, // 硃砂红
                        { offset: 1, color: '#c0392b' }
                    ]),
                    shadowBlur: 10,
                    shadowColor: 'rgba(192, 57, 43, 0.4)'
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
                data: points,
                symbolSize: function (val, params) {
                    const progress = params.data.progress || 0;
                    return Math.max(12, progress / 8);
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
                    color: '#f1c40f', // 金色波纹
                    shadowBlur: 10,
                    shadowColor: 'rgba(241, 196, 15, 0.5)'
                },
                zlevel: 1
            }
        ]
    };

    chart.setOption(option);

    // 强制在渲染后进行一次 resize，确保地图布局正确
    setTimeout(() => {
        chart.resize();
    }, 200);

    updateRouteStats(meta, points);
}



function updateRouteStats(meta, points) {
    const infoDiv = document.getElementById('route-info');
    const statsDiv = document.getElementById('route-stats');
    const summaryDiv = document.getElementById('route-summary');

    // 构建折叠树结构
    const countryGroups = {};
    points.forEach(p => {
        if (!countryGroups[p.country]) {
            countryGroups[p.country] = [];
        }
        countryGroups[p.country].push(p);
    });

    const treeHtml = meta.countries.map(c => {
        const countryPoints = countryGroups[c.name] || [];
        const locationsHtml = countryPoints.map(p => {
            const hardshipsHtml = p.hardships && p.hardships.length
                ? `<ul>${p.hardships.map(h => `<li>第${h.number}难：${h.description}</li>`).join('')}</ul>`
                : '<ul><li>行程推进</li></ul>';

            return `
                <li class="tree-location">
                    <details>
                        <summary>${p.name}</summary>
                        <div class="tree-content">
                            <p class="location-desc">${p.description || ''}</p>
                            ${hardshipsHtml}
                        </div>
                    </details>
                </li>
            `;
        }).join('');

        return `
            <details class="tree-country">
                <summary><strong>${c.name}</strong> <small>(${c.locationCount}地, ${c.hardshipCount}难)</small></summary>
                <ul class="tree-location-list">${locationsHtml}</ul>
            </details>
        `;
    }).join('');

    infoDiv.innerHTML = `
        <div class="route-tree-container">
            ${treeHtml}
        </div>
    `;

    // 填充中间的总结栏
    if (summaryDiv) {
        summaryDiv.innerHTML = `
            <div class="stats-summary-bar">
                <div class="stat-item">
                    <span class="stat-label">总难数</span>
                    <span class="stat-value">${meta.totalHardships}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">停留地点</span>
                    <span class="stat-value">${meta.totalLocations}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">途经国家</span>
                    <span class="stat-value">${meta.countryCount}</span>
                </div>
                <div class="stat-item wide">
                    <span class="stat-label">通关印章</span>
                    <div class="seal-container">
                        ${meta.passportSeals.length
                ? meta.passportSeals.map(seal => `<span class="seal-chip">${seal}</span>`).join('')
                : '<span class="stat-value-small">暂无记录</span>'}
                    </div>
                </div>
            </div>
        `;
    }

    // 右侧：从整个西游记概括节点
    // 选取具有代表性的节点：起点、收徒节点、关键转折点、终点
    const keyMilestones = [];

    // 1. 起点
    if (points.length > 0) keyMilestones.push(points[0]);

    // 2. 寻找关键节点（收徒、重大转折）
    const milestoneKeywords = ['悟空', '悟能', '悟净', '白龙马', '八戒', '沙僧', '女儿国', '火焰山', '雷音寺'];
    const foundMilestones = points.filter(p =>
        milestoneKeywords.some(k => (p.description || '').includes(k) || p.name.includes(k))
    );

    // 去重并限制数量，确保覆盖全过程
    const uniqueMilestones = [];
    const seenNames = new Set([points[0].name]);

    foundMilestones.forEach(p => {
        if (!seenNames.has(p.name) && p.sequence !== points.length) {
            uniqueMilestones.push(p);
            seenNames.add(p.name);
        }
    });

    // 如果关键节点太少，按比例补充
    if (uniqueMilestones.length < 5) {
        [0.25, 0.5, 0.75].forEach(ratio => {
            const idx = Math.floor(points.length * ratio);
            if (!seenNames.has(points[idx].name)) {
                uniqueMilestones.push(points[idx]);
                seenNames.add(points[idx].name);
            }
        });
    }

    keyMilestones.push(...uniqueMilestones);

    // 3. 终点
    const lastPoint = points[points.length - 1];
    if (!seenNames.has(lastPoint.name)) {
        keyMilestones.push(lastPoint);
    }

    // 按顺序排列
    keyMilestones.sort((a, b) => a.sequence - b.sequence);

    const milestoneText = keyMilestones
        .map(point => {
            const firstHardship = point.hardships && point.hardships.length ? point.hardships[0].description : '抵达此地';
            return `<div class="milestone-item">
                <span class="milestone-seq">${point.sequence}</span>
                <span class="milestone-name">${point.name}</span>
                <span class="milestone-desc">${firstHardship}</span>
            </div>`;
        })
        .join('');

    statsDiv.innerHTML = `<div class="milestone-list">${milestoneText}</div>`;
}

let chinaMapLoader = null;
let routeDataLoader = null;

async function ensureChinaMapRegistered() {
    if (echarts.getMap && echarts.getMap('china')) {
        return true;
    }

    if (!chinaMapLoader) {
        chinaMapLoader = fetchChinaGeoJson();
    }

    try {
        const geoJson = await chinaMapLoader;
        if (geoJson) {
            echarts.registerMap('china', geoJson);
            return true;
        }
    } catch (error) {
        console.error('Failed to register China map:', error);
    }
    return false;
}

async function fetchChinaGeoJson() {
    const localChinaMapURL = "src/data/china&india.json"
    // 有本地资源直接返回
    const localResponse = await fetch(localChinaMapURL);
    if (localResponse.ok) {
        console.log("成功加载本地地图数据");
        return await localResponse.json();
    }

    try {
        const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/geojson?code=100000_full');
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('China geojson request failed:', error);
        return null;
    }
}

async function loadRouteData() {
    if (!routeDataLoader) {
        routeDataLoader = fetchRouteJson();
    }
    try {
        return await routeDataLoader;
    } catch (error) {
        console.error('Route data request failed:', error);
        return null;
    }
}

async function fetchRouteJson() {
    try {
        const response = await fetch(ROUTE_DATA_URL);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Route json fetch error:', error);
        throw error;
    }
}

function transformRouteData(raw) {
    const data = raw && raw.journey_to_the_west ? raw.journey_to_the_west : null;

    if (!data) {
        return { points: [], lines: [], meta: { totalHardships: 0, totalLocations: 0, countryCount: 0, passportSeals: [], countries: [] } };
    }

    // console.log(data);

    const points = [];
    const lines = [];
    let previousPoint = null;

    const countriesMeta = [];
    const declaredHardships = data.total_hardships || 0;
    let maxHardshipNumber = 0;

    (data.countries || []).forEach(country => {
        const locations = country.locations || [];

        let countryHardships = 0;
        locations.forEach(location => {
            // console.log(location)
            const location_description = location.description || '';
            const hardships = location.hardships || [];
            countryHardships += hardships.length;

            const sequence = points.length + 1;
            const peakHardshipNumber = hardships.reduce((peak, hardship) => Math.max(peak, hardship.number || 0), maxHardshipNumber);
            maxHardshipNumber = Math.max(maxHardshipNumber, peakHardshipNumber);

            const point = {
                name: location.name,
                coord: [location.lng, location.lat],
                description: location_description,
                hardships,
                hardshipCount: hardships.length,
                country: country.name,
                sequence,
                peakHardshipNumber,
                isStart: sequence === 1 // 标记起点
            };

            // console.log("point", point)

            points.push(point);

            if (previousPoint) {
                // 计算颜色深度，随进度加深
                lines.push({
                    coords: [
                        [previousPoint.coord[0], previousPoint.coord[1]],
                        [point.coord[0], point.coord[1]]
                    ],
                    tooltip: `${previousPoint.name} → ${point.name}`,
                    lineStyle: {
                        // 这里先占位，后面在 enrichedLines 循环里根据最终总数计算精确颜色
                        color: '#d35400'
                    }
                });
            }
            previousPoint = point;
        });

        countriesMeta.push({
            name: country.name,
            locationCount: locations.length,
            hardshipCount: countryHardships
        });
    });

    const totalLocations = points.length;
    const totalHardships = declaredHardships || maxHardshipNumber || points.reduce((sum, point) => sum + point.hardshipCount, 0);

    // 为线段添加渐变色
    const enrichedLines = lines.map((line, index) => {
        const ratio = index / lines.length;
        // 优化颜色方案：从明亮的金橙色渐变到深沉的硃砂红/古铜色
        // 色相从 45 (金黄) 逐渐转向 10 (深红)
        const hue = 45 - (ratio * 35);
        const saturation = 80 + (ratio * 20); // 越往后越鲜艳
        const lightness = 65 - (ratio * 35);  // 越往后越深沉

        return {
            ...line,
            lineStyle: {
                ...line.lineStyle,
                color: `hsl(${hue}, ${Math.min(100, saturation)}%, ${lightness}%)`,
                opacity: 0.7 + (ratio * 0.3) // 透明度也随之增加
            }
        }
    });

    let trackedHardshipNumber = 0;
    const enrichedPoints = points.map(point => {
        trackedHardshipNumber = Math.max(trackedHardshipNumber, point.peakHardshipNumber);
        const hardshipProgress = totalHardships ? Math.round(trackedHardshipNumber / totalHardships * 100) : 0;
        const sequenceProgress = totalLocations ? Math.round(point.sequence / totalLocations * 100) : 0;
        const progress = hardshipProgress || sequenceProgress;

        return {
            name: point.name,
            value: [point.coord[0], point.coord[1], progress],
            coord: point.coord,
            description: point.description,
            hardships: point.hardships,
            hardshipCount: point.hardshipCount,
            country: point.country,
            sequence: point.sequence,
            progress,
            isStart: point.isStart
        };
    });

    const meta = {
        totalHardships,
        totalLocations,
        countryCount: countriesMeta.length,
        passportSeals: data.passport_seals || [],
        countries: countriesMeta
    };

    return { points: enrichedPoints, lines: enrichedLines, meta };
}
