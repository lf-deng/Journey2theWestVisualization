# 西游记数据可视化分析平台

## 📚 项目简介

这是一个基于《西游记》的综合数据可视化分析平台，使用 **ECharts** 作为主要可视化库，展示西游记中的人物关系、特征分析、取经路线、高频词汇等多维度数据。

## 🎯 核心功能

### 1️⃣ 人物关系网络可视化
- **展示内容**：西游记主要人物及其关系
- **图表类型**：节点链接图（Graph）
- **交互功能**：支持拖拽和缩放
- **数据维度**：
  - 节点大小代表出场频率
  - 节点颜色代表人物类型（主角、神仙、妖怪）
  - 连接线表示人物之间的相关性

### 2️⃣ 人物特征分析
- **妖怪来历分布**：天庭下凡 / 本土成精 / 其他（饼图）
- **妖怪结局分布**：被击杀 / 被收服 / 被神仙带回（饼图）
- **神仙派系对比**：道教 vs 佛教出场频次（柱状图）
- **数据展示**：按章节段落展示派系出现频率变化

### 3️⃣ 取经路线交互式可视化
- **地图展示**：中国地图为背景
- **路线标注**：长安 → 灵山的完整路线
- **信息标签**：各站点的主要事件、磨难、停留时长
- **动画效果**：涟漪散射效果展示取经进度

### 4️⃣ 高频词汇分析
- **全书高频词**：词云展示
- **前后期对比**：
  - 前期（第1-30回）："大闹天宫"、"齐天大圣"
  - 后期（第71-100回）："取经"、"师父"、"灵山"
- **角色专属词汇**：
  - 孙悟空：俺老孙、大圣、金箍棒
  - 唐僧：阿弥陀佛、徒弟、修行

### 5️⃣ 读者评价分析
- **关键词云**：展示读者对人物的评价关键词
- **情感倾向**：正面 / 中立 / 负面评价分布
- **人物评价**：四大主角的综合评价

## 📁 项目结构

```
Journey to the West/
├── index.html                 # 主页面入口
├── src/
│   ├── css/
│   │   └── style.css         # 全局样式表
│   ├── js/
│   │   ├── main.js           # 主脚本（页面管理、工具函数）
│   │   └── pages/            # 各页面脚本
│   │       ├── network.js    # 人物关系网络
│   │       ├── character.js  # 人物特征分析
│   │       ├── route.js      # 取经路线
│   │       ├── wordcloud.js  # 高频词汇
│   │       └── sentiment.js  # 评价分析
│   └── data/
│       └── journey-data.json # 样例数据
├── data/                      # 原始数据目录
├── README.md                  # 项目说明（本文件）
├── graph.html                 # 原始参考文件
└── js.js                      # 原始参考脚本
```

## 🛠 技术栈

### 核心依赖
- **ECharts 5.x** - 数据可视化库
- **HTML5** - 页面结构
- **CSS3** - 样式与动画
- **JavaScript ES6+** - 逻辑处理

### 外部资源
```html
<!-- ECharts 库 -->
<script src="https://fastly.jsdelivr.net/npm/echarts@5/dist/echarts.min.js"></script>
```

### 可选扩展
- ECharts WordCloud 扩展（用于词云展示）
- ECharts GL（用于3D效果）
- ECharts Map（地理信息展示）

## 🚀 快速开始

### 1. 文件准备
确保项目结构完整，所有文件都在指定目录中。

### 2. 启动项目
使用任何 HTTP 服务器打开 `index.html`：

```bash
# 使用 Python 3
python -m http.server 8000

# 使用 Node.js (http-server)
npx http-server

# 使用 VS Code Live Server 扩展
# 右键点击 index.html → Open with Live Server
```

### 3. 访问应用
在浏览器中打开：`http://localhost:8000`

## 📊 各页面详细说明

### 首页 (Home)
- 项目总览
- 五大可视化功能卡片
- 快速导航链接

### 人物关系网络 (Network)
**文件**：`src/js/pages/network.js`

**核心功能**：
```javascript
// 图表类型：Graph
// 布局方式：Force-directed layout
// 交互：缩放、拖拽、高亮邻接点
```

**数据结构**：
```json
{
  "nodes": [
    { "name": "唐僧", "value": 100, "category": "主角" }
  ],
  "links": [
    { "source": "唐僧", "target": "孙悟空", "value": 95 }
  ]
}
```

### 人物特征分析 (Character)
**文件**：`src/js/pages/character.js`

**包含的图表**：
1. **妖怪来历分布** - 饼图
2. **妖怪结局分布** - 饼图
3. **神仙派系对比** - 柱状图

### 取经路线 (Route)
**文件**：`src/js/pages/route.js`

**展示方式**：
- 地理信息（Geo）基础
- 路线展示（Lines）
- 停留地点标注（Scatter）
- 进度动画（EffectScatter）

### 高频词汇 (WordCloud)
**文件**：`src/js/pages/wordcloud.js`

**包含的图表**：
1. 全书高频词 - 词云
2. 前期高频词 - 条形图
3. 后期高频词 - 条形图
4. 孙悟空专属词 - 热力柱状图
5. 唐僧专属词 - 热力柱状图

### 评价分析 (Sentiment)
**文件**：`src/js/pages/sentiment.js`

**包含的图表**：
1. 人物评价关键词 - 气泡分布图
2. 人物情感倾向 - 饼图

## 💡 核心类和函数

### PageManager（页面管理器）
```javascript
const pageManager = new PageManager();
// 自动处理页面切换和导航更新
```

### ChartManager（图表管理器）
```javascript
const chartManager = new ChartManager();
chartManager.initChart(containerId);
chartManager.setOption(containerId, option);
chartManager.showLoading(containerId);
chartManager.hideLoading(containerId);
```

### Utils（工具函数）
```javascript
Utils.getRandomColor();           // 生成随机颜色
Utils.getPalette();               // 获取调色板
Utils.delay(ms);                  // 延迟函数
Utils.loadJSON(url);              // 加载JSON数据
Utils.formatNumber(num);          // 格式化数字
```

## 🎨 设计特点

### 色彩方案
```css
主色调：#667eea (紫蓝色)
副色调：#764ba2 (深紫)
强调色：#43e97b (绿色)
警告色：#fa709a (粉红)
```

### 响应式设计
- **桌面端**：网格布局最优化
- **平板**：自适应列数
- **移动端**：单列布局

### 动画效果
- 页面切换淡入动画
- 卡片悬停效果
- 图表加载动画
- 图表交互高亮

## 📈 数据集成

### 添加真实数据

**步骤1**：准备数据文件
```json
// src/data/your-data.json
{
  "nodes": [...],
  "links": [...],
  "categories": [...]
}
```

**步骤2**：加载数据
```javascript
const data = await Utils.loadJSON('src/data/your-data.json');
```

**步骤3**：更新图表选项
```javascript
option.series[0].data = data.nodes;
option.series[0].links = data.links;
chart.setOption(option);
```

## 🔧 自定义指南

### 修改色彩主题

**方式1**：CSS 变量（推荐）
```css
/* src/css/style.css */
:root {
  --primary-color: #667eea;
  --secondary-color: #764ba2;
}
```

**方式2**：ECharts 选项
```javascript
itemStyle: {
  color: '#your-color'
}
```

### 添加新的可视化页面

**步骤1**：在 `index.html` 添加页面 HTML
```html
<div id="newpage" class="page">
  <div id="chart-container" class="chart-wrapper"></div>
</div>
```

**步骤2**：创建脚本文件 `src/js/pages/newpage.js`
```javascript
function initNewPageChart() {
  const chart = window.chartManager.initChart('chart-container');
  const option = { /* ECharts 配置 */ };
  chart.setOption(option);
}
```

**步骤3**：在 `index.html` 引入脚本
```html
<script src="src/js/pages/newpage.js"></script>
```

**步骤4**：在导航栏添加链接
```html
<li><a href="#newpage">新页面</a></li>
```

## 📚 ECharts 资源

- [ECharts 官方文档](https://echarts.apache.org)
- [ECharts 示例库](https://echarts.apache.org/examples)
- [ECharts 配置项手册](https://echarts.apache.org/option.html)

## 🐛 常见问题

### Q: 为什么图表不显示？
**A**: 检查：
1. 容器元素是否存在
2. 图表容器是否有高度
3. ECharts 库是否正确加载
4. 浏览器控制台是否有错误

### Q: 如何修改图表大小？
**A**: 修改 CSS 中的 `chart-wrapper` 高度：
```css
.chart-wrapper {
  height: 600px; /* 修改此值 */
}
```

### Q: 如何添加新数据？
**A**: 编辑 `src/data/journey-data.json` 或创建新的数据文件，然后用 `Utils.loadJSON()` 加载。

### Q: 如何改变配色方案？
**A**: 编辑 `src/css/style.css` 中的颜色变量，或直接修改 ECharts 选项中的 `color` 字段。

## 🤝 扩展建议

1. **数据持久化**：接入数据库或 API
2. **数据导出**：支持 PNG / SVG / Excel 导出
3. **高级交互**：钻取、筛选、搜索功能
4. **实时更新**：WebSocket 实时数据推送
5. **主题切换**：暗色主题支持
6. **多语言**：国际化支持

## 📝 许可证

本项目仅用于学习和教育目的。

## 👨‍💻 开发者

- 创建时间：2024年12月19日
- 基于 ECharts 5.x
- 兼容现代浏览器（Chrome、Firefox、Safari、Edge）

## 📧 反馈与建议

欢迎提出问题和改进建议！

---

**祝您使用愉快！** 🎉
