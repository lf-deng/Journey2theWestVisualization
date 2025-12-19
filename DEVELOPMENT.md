# 开发指南

## 📋 项目开发流程

### 1. 项目初始化
```bash
# 使用 HTTP 服务器启动项目
python -m http.server 8000
# 或者
npx http-server
```

### 2. 开发工作流

#### 修改样式
- 编辑 `src/css/style.css`
- 支持 CSS3 特性（Grid、Flexbox、Animation）
- 修改后刷新浏览器查看效果

#### 修改脚本
- 编辑 `src/js/main.js`（全局逻辑）
- 编辑 `src/js/pages/*.js`（具体图表）
- 开启浏览器开发者工具（F12）查看控制台错误

#### 修改数据
- 编辑 `src/data/journey-data.json`
- 或创建新的 JSON 数据文件
- 用 `Utils.loadJSON()` 加载数据

## 🏗 架构设计

### 全局对象

```javascript
window.pageManager    // 页面管理器
window.chartManager   // 图表管理器
window.Utils         // 工具函数库
```

### 事件系统

#### 页面加载事件
```javascript
// 监听页面切换
window.addEventListener('pageLoaded', (e) => {
  console.log('切换到页面:', e.detail.page);
});
```

#### 窗口大小改变事件
```javascript
// 自动触发，图表会自动响应
window.addEventListener('resize', () => {
  // 图表自动调整大小
});
```

## 🔄 图表更新流程

### 方式一：直接设置选项
```javascript
const chart = window.chartManager.getChart('container-id');
const newOption = { /* ECharts 配置 */ };
chart.setOption(newOption);
```

### 方式二：通过管理器
```javascript
window.chartManager.setOption('container-id', option);
```

### 方式三：异步加载数据
```javascript
async function updateChart() {
  window.chartManager.showLoading('container-id');
  
  const data = await Utils.loadJSON('src/data/data.json');
  
  const option = { /* 使用 data 创建选项 */ };
  window.chartManager.setOption('container-id', option);
  
  window.chartManager.hideLoading('container-id');
}
```

## 📊 ECharts 常用图表配置

### 饼图
```javascript
{
  type: 'pie',
  data: [
    { value: 100, name: '项目1' },
    { value: 200, name: '项目2' }
  ],
  radius: '70%'
}
```

### 柱状图
```javascript
{
  type: 'bar',
  xAxisType: 'category',
  xAxisData: ['类别1', '类别2'],
  data: [100, 200]
}
```

### 关系图
```javascript
{
  type: 'graph',
  layout: 'force',  // 或 'none'
  nodes: [],
  links: [],
  categories: []
}
```

### 散点图
```javascript
{
  type: 'scatter',
  data: [[10, 20], [30, 40]],
  symbolSize: 10
}
```

### 线图
```javascript
{
  type: 'line',
  data: [10, 20, 30, 40],
  smooth: true
}
```

## 🎨 样式开发

### CSS 架构
```
style.css
├── 全局样式 (*, body)
├── 导航栏样式 (.navbar)
├── 容器样式 (.container, .page)
├── 页面标题样式 (.page-header)
├── 图表容器样式 (.chart-container)
├── 网格布局 (.charts-grid)
├── 卡片样式 (.card)
├── 按钮样式 (.btn)
└── 响应式设计 (@media)
```

### 自定义变量
在 CSS 顶部添加变量：
```css
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
  --success-color: #43e97b;
  --warning-color: #fa709a;
  --border-radius: 8px;
}

body {
  background: var(--primary-color);
}
```

## 🔌 插件集成

### 添加 WordCloud 扩展
```html
<!-- 在 index.html 中添加 -->
<script src="https://fastly.jsdelivr.net/npm/echarts-wordcloud@2/dist/wordcloud.min.js"></script>
```

然后在脚本中使用：
```javascript
{
  type: 'wordCloud',
  data: wordData,
  sizeRange: [24, 72]
}
```

### 添加 Map 地图
```html
<!-- 中国地图 -->
<script src="https://fastly.jsdelivr.net/npm/echarts@5/map/js/china.js"></script>
```

使用示例：
```javascript
{
  type: 'scatter',
  coordinateSystem: 'geo',
  geoIndex: 0
}
```

## 📱 响应式布局

### 断点设置
```css
/* 桌面端 (> 1024px) */
.charts-grid {
  grid-template-columns: 1fr 1fr;
}

/* 平板 (768px - 1024px) */
@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

/* 移动端 (< 768px) */
@media (max-width: 768px) {
  .navbar-container {
    flex-direction: column;
  }
}
```

## 🧪 调试技巧

### 启用 ECharts 调试
```javascript
// 在浏览器控制台运行
let chart = window.chartManager.getChart('network-chart');
console.log(chart.getOption()); // 查看图表配置
```

### 导出图表为图片
```javascript
const chart = window.chartManager.getChart('network-chart');
const image = chart.getDataURL({
  type: 'png',
  pixelRatio: 2
});
// 下载图片或发送到服务器
```

### 性能监测
```javascript
// 测量图表初始化时间
console.time('chart-init');
initNetworkChart();
console.timeEnd('chart-init');
```

## 🚀 性能优化

### 1. 数据量优化
- 限制节点数量（建议 < 1000）
- 使用分页或虚拟滚动
- 数据聚合和降维

### 2. 渲染优化
```javascript
// 使用 Canvas 渲染（更快）
echarts.init(dom, null, {
  renderer: 'canvas'  // 而不是 'svg'
});
```

### 3. 动画优化
```javascript
// 大数据集关闭动画
option: {
  animationDuration: 0  // 禁用动画
}
```

### 4. 内存管理
```javascript
// 页面卸载时释放图表
window.addEventListener('beforeunload', () => {
  window.chartManager.disposeAll();
});
```

## 📦 构建部署

### 压缩资源（可选）
```bash
# 使用 UglifyJS 压缩 JavaScript
uglifyjs src/js/main.js -o src/js/main.min.js

# 使用 CSSnano 压缩 CSS
cssnano src/css/style.css -o src/css/style.min.css
```

### 部署检查清单
- [ ] 所有图表正常显示
- [ ] 导航切换正常
- [ ] 响应式设计测试
- [ ] 浏览器兼容性检查
- [ ] 页面加载性能评测
- [ ] 错误日志检查

## 🔐 安全注意事项

### 数据验证
```javascript
// 加载外部数据时进行验证
const data = await Utils.loadJSON('url');
if (!data || !Array.isArray(data)) {
  console.error('Invalid data format');
  return;
}
```

### XSS 防护
- 避免使用 innerHTML 插入用户输入
- 使用 textContent 代替 innerHTML
- 对 URL 参数进行编码

## 🆘 故障排查

### 常见错误

#### 1. "Cannot read property of undefined"
**原因**：容器 ID 不匹配或不存在
**解决**：检查 HTML 中的 ID 是否与脚本中的一致

#### 2. 图表不显示
**原因**：容器没有高度或宽度
**解决**：确保 `.chart-wrapper` 有明确的尺寸

#### 3. 数据加载失败
**原因**：CORS 问题或文件路径错误
**解决**：检查控制台错误，验证文件路径

#### 4. 页面切换无效
**原因**：页面 ID 与导航链接 href 不匹配
**解决**：确保 `id` 和 `href=#id` 对应

---

**祝您开发愉快！** 🎉
