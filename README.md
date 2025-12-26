# 🐒 《西游记》文本数据可视化分析平台

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![ECharts](https://img.shields.io/badge/ECharts-5.x-red.svg)](https://echarts.apache.org/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

这是一个基于《西游记》叙事数据的前端可视化项目。通过自然语言处理（NLP）与大语言模型（LLM）技术对原著文本进行深度挖掘，从人物关系、角色特征、地理路径、词频演变及情感倾向等多个维度，探索中国古典名著的数字化呈现方式。

## 🌟 核心功能

- **🕸️ 人物关系网络**：利用 Force 布局展示主角、神仙、妖怪之间的社交网络，节点大小代表出场频次，连线粗细反映关联强度。
- **🔍 角色属性特征**：多维度对比妖怪的来历（野怪 vs 有背景）、结局（被杀 vs 被收服）以及道佛派系的出场趋势。
- **🗺️ 取经路线空间可视化**：基于中国地图还原唐僧师徒的地理行迹，动态展示九九八十一难的空间分布与劫难统计。
- **☁️ 文本高频词汇分析**：结合词云图与动态条形图，分析全书及不同阶段的核心词汇演变。
- **💬 读者情感评价**：整合文本评论数据，通过词云与情感饼图呈现读者对四大主角的评价倾向。
- **📖 章节对比阅读**：提供原文与白话文的实时对照阅读工具，支持章节快速切换。

## 🛠️ 技术栈

- **前端渲染**：[Apache ECharts 5.x](https://echarts.apache.org/) (核心引擎), [echarts-wordcloud](https://github.com/ecomfe/echarts-wordcloud) (词云扩展)
- **核心架构**：原生 JavaScript (ES6+), CSS3 (Grid & Flexbox), HTML5
- **数据处理**：Python, OpenAI API (用于白话文翻译与文本清洗), Jupyter Notebook
- **地图数据**：GeoJSON (中国与西域地理数据)

## 📂 项目结构

```text
Journey2theWestVisualization/
├── index.html                # 项目主入口
├── src/
│   ├── js/
│   │   ├── main.js           # 页面管理与图表初始化核心逻辑
│   │   └── pages/            # 各功能模块独立脚本
│   │       ├── network.js    # 人物关系图谱
│   │       ├── route.js      # 取经路线地图
│   │       └── ...           # 其他模块
│   ├── css/
│   │   └── style.css         # 全局样式与响应式设计
│   ├── data/                 # 核心数据集（JSON, CSV, TXT）
│   │   ├── llm_text_processing.py # LLM 数据处理脚本
│   │   └── ...
│   └── pages/
│       └── compare.html      # 章节对比阅读页面
└── echart_demo/              # 早期原型与参考 Demo

```

## 🚀 快速开始

### 1. 环境准备
本项目为纯前端应用，仅需一个静态文件服务器即可运行。

### 2. 启动项目
推荐使用 VS Code 的 **Live Server** 扩展，或在终端运行以下命令：

```bash
# 使用 Python 启动
python -m http.server 8000

# 或使用 Node.js 启动
npx http-server -p 8000
```

访问 `http://localhost:8000/index.html` 即可进入平台。

### 3. 数据处理（可选）
若需重新生成白话文数据，请配置 [src/data/.env](src/data/.env) 中的 API 密钥，并运行：
```bash
cd src/data
python llm_text_processing.py
```

## 📊 数据处理工作流

1. **文本提取**：从原始文本中提取章节内容。
2. **LLM 翻译**：调用大模型（如 Qwen, GPT）将古文段落转换为现代白话文。
3. **特征提取**：通过 NLP 脚本统计人物共现、词频及情感关键词。
4. **格式转换**：将处理后的数据转换为 ECharts 可识别的 JSON 格式。

## 📝 开发指南

有关架构设计、事件系统及如何新增图表的详细信息，请参阅 [DEVELOPMENT.md](DEVELOPMENT.md)。

## 🤝 贡献与致谢

- **开发团队**：华东师范大学研究生数据可视化课程 - 文本可视化小组
- **数据来源**：公开网络资源及《西游记》原著。
- **可视化框架**：感谢 [Apache ECharts](https://echarts.apache.org/) 团队。
- **项目初衷**：本项目仅用于数据可视化课程学习与演示。

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可。

---
*🐒 踏平坎坷成大道，斗罢艰险又出发。*

