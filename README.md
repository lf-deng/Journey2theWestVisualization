# 西游记数据可视化分析平台

一个基于《西游记》叙事数据的前端可视化项目，聚合人物关系、角色特征、取经路线、词频分析与读者情感。所有图表由 ECharts 5.x 渲染，可在现代浏览器中直接运行。

## 功能总览

- 人物关系网络：Force 布局展示主角、神仙、妖怪之间的关系强度与出场频次。
- 人物特征分析：三个图表对比妖怪来历/结局与道佛派系出场趋势。
- 取经路线：基于中国地图的路线、停留点与劫难统计，含波纹动画。
- 高频词汇：词云与柱状图分析全书、阶段、角色词频，提供词云降级方案。
- 读者评价分析：关键词云及情感饼图呈现四大主角评价倾向。
- 章节对比阅读：原文与白话对照阅读工具（独立页面 compare.html）。

## 页面与核心脚本

- 首页：index.html 定义导航、卡片入口以及页面容器；页面切换由 src/js/main.js 的 PageManager 管理。
- 人物关系网络：src/js/pages/network.js 构建交互式图谱并展示统计摘要。
- 人物特征分析：src/js/pages/character.js 渲染三个静态示例图表，可替换为真实统计。
- 取经路线：src/js/pages/route.js 加载 src/data/取经路线.json，动态注册中国地图并生成线路/散点/effectScatter 组合。
- 高频词汇：src/js/pages/wordcloud.js 结合词云与条形图，内部含词云扩展不可用时的降级逻辑。
- 读者评价：src/js/pages/sentiment.js 提供词云和情感饼图，并在缺少词云扩展时切换到散点气泡。
- 章节对比：src/pages/compare.html + src/js/pages/compare.js 读取《西游记-白话文》数据，支持章节选择与原译切换。

## 数据与资源

- 静态数据：src/data/ 目录存放多版本原文、白话译文、路线数据、地图 GeoJSON、停用词表等。
- 地图资源：优先加载 src/data/china&india.json，如失败回退到阿里云 GeoJSON。
- LLM 处理脚本：src/data/llm_text_processing.py 将原文按段调用 OpenAI 兼容 API 生成白话译文；通过 .env（示例）配置 base_url、模型与密钥。
- 示例资源：echart_demo/ 为早期参考 demo 与 Les Miserables 图谱脚本。

## 快速开始

1. 安装依赖：项目仅依赖浏览器与远程 ECharts CDN，无需额外构建步骤。
2. 启动静态服务器：推荐 VS Code Live Server，或运行 `python -m http.server 8000`，再访问 `http://localhost:8000/index.html`。
3. 若需 compare 页面，在同一服务器下访问 `http://localhost:8000/src/pages/compare.html`。

> 注意：词云图依赖 echarts-wordcloud 扩展，index.html 已通过 CDN 引入。

## 项目结构

```
Journey2theWestVisualization/
├── index.html
├── README.md
├── DEVELOPMENT.md
├── fetch_txt.ipynb
├── echart_demo/
│   ├── graph.html
│   └── Les Miserables.js
├── src/
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── main.js
│   │   └── pages/
│   │       ├── character.js
│   │       ├── compare.js
│   │       ├── network.js
│   │       ├── route.js
│   │       ├── sentiment.js
│   │       └── wordcloud.js
│   ├── pages/
│   │   └── compare.html
│   ├── components/
│   └── data/
│       ├── .env
│       ├── china&india.json
│       ├── chinamap.json
│       ├── journey-data.json
│       ├── llm_text_processing.py
│       ├── stopwords_cn.txt
│       ├── worldmap.json
│       ├── 取经路线.json
│       ├── 国学梦-西游记白话版.json
│       ├── 国学梦.csv
│       ├── 汉程网-西游记白话版.json
│       ├── 汉程网.csv
│       ├── 西游记-原文.json
│       ├── 西游记-白话文.json
│       └── 西游记.txt
└── .git/
```

## 自定义与二次开发

- 更换配色：修改 src/css/style.css 中的渐变色与卡片样式；或在各图表 option 中调整 itemStyle。
- 替换数据：使用 Utils.loadJSON（src/js/main.js）加载新的 JSON 文件，然后更新对应 series 数据。
- 新增页面：在 index.html 添加页面占位，并在 src/js/pages 中创建相应脚本，最后在导航栏引入链接。
- 响应式优化：style.css 已提供基础断点，可按需求调整 grid 与 chart wrapper 高度。

## 数据处理工作流

1. 将原文 JSON 放入 src/data/（示例：西游记-原文.json）。
2. 配置 src/data/.env 或环境变量（OPENAI_BASE_URL、OPENAI_MODEL、OPENAI_API_KEY）。
3. 在有 Python 与 openai-sdk 的环境中运行 `python llm_text_processing.py` 生成 西游记-白话文.json。
4. 在 compare 页面或可视化脚本中加载新生成的译文数据。

## 许可证与致谢

本项目仅用于课程学习与演示，数据来源于公开网络资源。《西游记》原著版权归原作者及出版社所有，感谢 Apache ECharts 团队提供的可视化框架。
