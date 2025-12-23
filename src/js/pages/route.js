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
                if (params.componentSubType === 'scatter' || params.componentSubType === 'effectScatter') {
                    const data = params.data;
                    const hardshipText = data.hardships && data.hardships.length
                        ? data.hardships.map(h => `第${h.number}难：${h.description}`).join('<br>')
                        : '暂无记录';
                    return [
                        `<strong>${params.name}</strong>`,
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
                data: lines,
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
                    color: '#43e97b',
                    shadowBlur: 10,
                    shadowColor: 'rgba(67, 233, 123, 0.5)'
                },
                zlevel: 1
            }
        ]
    };

    chart.setOption(option);

    updateRouteStats(meta, points);
}



function updateRouteStats(meta, points) {
    const infoDiv = document.getElementById('route-info');
    const statsDiv = document.getElementById('route-stats');

    const countryLines = meta.countries.length
        ? meta.countries
            .map(country => `${country.name}（${country.locationCount}地，${country.hardshipCount}难）`)
            .join('<br>')
        : '暂无数据';

    const milestoneText = points.length
        ? points.slice(0, 5)
            .map(point => {
                const firstHardship = point.hardships && point.hardships.length ? point.hardships[0].description : '行程推进';
                return `${point.sequence}. ${point.name} - ${firstHardship}`;
            })
            .join('<br>')
        : '暂无节点';

    infoDiv.innerHTML = [
        `<strong>途经国家：</strong><br>${countryLines}`,
        '<br>',
        `<strong>行程节点速览：</strong><br>${milestoneText}`
    ].join('');

    statsDiv.innerHTML = [
        `<strong>总难数：</strong>${meta.totalHardships}难`,
        `<strong>停留地点：</strong>${meta.totalLocations}处`,
        `<strong>途经国家：</strong>${meta.countryCount}个`,
        `<strong>通关印章：</strong>${meta.passportSeals.length ? meta.passportSeals.join('、') : '暂无记录'}`
    ].join('<br>');
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
            const hardships = location.hardships || [];
            countryHardships += hardships.length;

            const sequence = points.length + 1;
            const peakHardshipNumber = hardships.reduce((peak, hardship) => Math.max(peak, hardship.number || 0), maxHardshipNumber);
            maxHardshipNumber = Math.max(maxHardshipNumber, peakHardshipNumber);

            const point = {
                name: location.name,
                coord: [location.lng, location.lat],
                hardships,
                hardshipCount: hardships.length,
                country: country.name,
                sequence,
                peakHardshipNumber
            };

            points.push(point);

            if (previousPoint) {
                lines.push({
                    coords: [
                        [previousPoint.coord[0], previousPoint.coord[1]],
                        [point.coord[0], point.coord[1]]
                    ],
                    tooltip: `${previousPoint.name} → ${point.name}`
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
            hardships: point.hardships,
            hardshipCount: point.hardshipCount,
            country: point.country,
            sequence: point.sequence,
            progress
        };
    });

    const meta = {
        totalHardships,
        totalLocations,
        countryCount: countriesMeta.length,
        passportSeals: data.passport_seals || [],
        countries: countriesMeta
    };

    return { points: enrichedPoints, lines, meta };
}
