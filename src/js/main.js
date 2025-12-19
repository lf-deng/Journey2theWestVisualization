/* ============================================
   西游记数据可视化项目 - 主脚本
   ============================================ */

// 页面管理
class PageManager {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        // Bind navigation clicks and show the default page
        this.setupNavigation();
        this.loadPage('home');
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-links a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('href').substring(1);
                // Lazy-load the target page when the user clicks the nav item
                this.loadPage(pageId);
            });
        });
    }

    loadPage(pageId) {
        // 隐藏所有页面
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });

        // 显示目标页面
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;

            // 更新导航链接状态
            document.querySelectorAll('.nav-links a').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + pageId) {
                    link.classList.add('active');
                }
            });

            // 触发页面加载事件
            window.dispatchEvent(new CustomEvent('pageLoaded', { detail: { page: pageId } }));

            // 重置所有图表
            setTimeout(() => {
                if (window.echarts) {
                    Object.values(window.charts || {}).forEach(chart => {
                        if (chart) {
                            try {
                                chart.resize();
                            } catch (e) {
                                console.error('Chart resize error:', e);
                            }
                        }
                    });
                }
            }, 100);
        }
    }
}

// ECharts管理器
class ChartManager {
    constructor() {
        this.charts = {};
    }

    initChart(containerId, theme = null) {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error(`Container ${containerId} not found`);
            return null;
        }

        if (this.charts[containerId]) {
            // Dispose stale instance to avoid duplicated canvas elements
            this.charts[containerId].dispose();
        }

        const chart = echarts.init(container, theme || 'light', {
            renderer: 'canvas',
            useDirtyRect: false
        });

        this.charts[containerId] = chart;
        return chart;
    }

    getChart(containerId) {
        return this.charts[containerId];
    }

    setOption(containerId, option) {
        const chart = this.charts[containerId];
        if (chart) {
            chart.setOption(option);
        }
    }

    showLoading(containerId) {
        const chart = this.charts[containerId];
        if (chart) {
            chart.showLoading('default', {
                text: '加载中...',
                maskColor: 'rgba(255, 255, 255, 0.8)',
                textColor: '#667eea'
            });
        }
    }

    hideLoading(containerId) {
        const chart = this.charts[containerId];
        if (chart) {
            chart.hideLoading();
        }
    }

    dispose(containerId) {
        if (this.charts[containerId]) {
            this.charts[containerId].dispose();
            delete this.charts[containerId];
        }
    }

    disposeAll() {
        Object.keys(this.charts).forEach(key => {
            this.charts[key].dispose();
        });
        this.charts = {};
    }
}

// 工具函数
const Utils = {
    // 生成随机颜色
    getRandomColor() {
        const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30b0fe'];
        return colors[Math.floor(Math.random() * colors.length)];
    },

    // 生成调色板
    getPalette() {
        return ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140', '#30b0fe'];
    },

    // 延迟函数
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    // 从JSON文件加载数据
    async loadJSON(url) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Failed to load JSON:', url, error);
            return null;
        }
    },

    // 格式化数字
    formatNumber(num) {
        if (num > 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num > 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num;
    }
};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化全局变量
    window.pageManager = new PageManager();
    window.chartManager = new ChartManager();

    // 窗口重置大小事件
    window.addEventListener('resize', () => {
        // Keep charts responsive for viewport changes and sidebar toggles
        Object.values(window.chartManager.charts).forEach(chart => {
            if (chart) {
                try {
                    chart.resize();
                } catch (e) {
                    console.error('Chart resize error:', e);
                }
            }
        });
    });

    console.log('Application initialized successfully');
});
