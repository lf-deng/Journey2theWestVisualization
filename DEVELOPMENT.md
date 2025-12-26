# 🛠️ 开发与架构指南

本指南旨在帮助开发者理解《西游记》数据可视化分析平台的内部架构、开发流程以及如何进行二次开发。

## 🏗️ 架构设计

项目采用轻量级的原生 JavaScript 架构，通过模块化的方式管理页面切换、图表渲染与数据加载。

### 1. 核心管理器 (Core Managers)

项目在 `src/js/main.js` 中定义了两个核心类：

- **`PageManager`**: 负责单页应用（SPA）风格的页面切换。
  - 监听导航栏点击事件。
  - 管理 `.page` 容器的显示与隐藏。
  - 触发 `pageLoaded` 自定义事件，通知各模块初始化图表。
- **`ChartManager`**: 统一管理 ECharts 实例。
  - 负责图表的初始化、销毁与自适应（Resize）。
  - 提供 `setOption` 接口简化图表配置。

### 2. 模块化脚本 (Page Scripts)

每个功能页面对应 `src/js/pages/` 下的一个独立脚本：
- `network.js`: 处理复杂的人物关系图谱逻辑。
- `route.js`: 负责地理坐标转换与地图渲染。
- `wordcloud.js` & `sentiment.js`: 处理文本分析与词云展示。

## 🔄 开发工作流

### 1. 样式开发
- **文件**: `src/css/style.css`
- **规范**: 使用 CSS Variables 定义主题色，采用 Flexbox 和 Grid 进行响应式布局。
- **热更新**: 推荐使用 Live Server 实时预览样式修改。

### 2. 图表开发
若要新增一个图表，请遵循以下步骤：
1. 在 `index.html` 的对应页面容器中添加 `div` 占位符。
2. 在 `src/js/pages/` 创建新的脚本文件。
3. 监听 `pageLoaded` 事件：
   ```javascript
   window.addEventListener('pageLoaded', (e) => {
       if (e.detail.page === 'your-page-id') {
           initYourChart();
       }
   });
   ```
4. 使用 `window.chartManager.initChart('container-id')` 初始化。

### 3. 数据处理 (Python/LLM)
项目包含一个强大的数据预处理脚本 `src/data/llm_text_processing.py`：
- **功能**: 利用大语言模型将古文自动翻译为白话文，并提取结构化特征。
- **配置**: 在 `src/data/.env` 中设置 `OPENAI_API_KEY` 和 `BASE_URL`。
- **运行**: `python llm_text_processing.py`

## 📊 数据接口规范

所有图表数据建议存储在 `src/data/` 目录下，格式为标准 JSON。

### 示例：人物关系数据
```json
{
  "nodes": [{ "id": "孙悟空", "group": 1, "value": 100 }],
  "links": [{ "source": "孙悟空", "target": "唐僧", "value": 50 }]
}
```

## 🧪 调试与优化

### 调试技巧
- **图表实例获取**: 在控制台输入 `window.chartManager.charts['chart-id']` 即可直接操作 ECharts 实例。
- **性能监测**: 使用 `console.time()` 监测大数据量图表的渲染耗时。

### 性能优化建议
1. **按需加载**: 仅在页面切换到当前视图时才初始化图表。
2. **Canvas 渲染**: 对于节点数超过 500 的关系图，强制使用 `renderer: 'canvas'`。
3. **数据抽样**: 词云图建议限制展示词汇量在 100-200 之间以保证流畅度。

## 🚀 部署检查清单
- [ ] 检查所有 CDN 资源（ECharts, WordCloud）是否正常加载。
- [ ] 验证 `compare.html` 在独立服务器下的路径引用。
- [ ] 确保 `src/data/` 下的 JSON 文件无语法错误。
- [ ] 测试移动端适配情况。

---
*如有疑问，请参考 [README.md](README.md) 或提交 Issue。*

