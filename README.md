# 织映 · AI 服装视频制作项目

第一阶段为中文视频策划工作台：上传服装参考图和人物脸部参考图，自动整理人物设定、服装细节、场景和 **5 个视频分镜**。暂不接入视频生成平台，为可灵、即梦及其他服务预留统一 API。

## 功能

- JPG、PNG、WebP 上传、拖拽、预览、替换及移除，单张最大 5MB。
- 视频风格、场景、画面比例与 15/30/60 秒时长设置。
- 人物、服装、场景设定和五分镜草案；每个镜头包含时间、运镜、动作和生成提示词。
- 所有方案字段可编辑，导出 JSON；桌面与手机布局。
- 可选视觉 AI 分析；未配置密钥时使用明确标注的模板模式。
- 可灵、即梦和自定义视频供应商适配器契约，提交与查询接口。

## 安装与运行

需要 **Node.js 24+** 和 npm。

```bash
cd fashion-video-workflow
npm ci
cp .env.example .env
npm run dev
```

访问 **http://localhost:3000**。

```bash
npm start       # 常规启动
npm test        # 策划规则及 API 测试
npm run check   # JavaScript 语法检查
```

`npm run dev` 自动监测服务端代码修改，浏览器需刷新。更改 `.env` 后重启服务。Windows 可手动复制 `.env.example` 为 `.env`。依赖包括 Express 5、Helmet、express-rate-limit；测试使用 Node 内置测试工具和 Supertest，锁定版本见 `package-lock.json`。

## AI 图片分析配置

在 `.env` 填写 `OPENAI_API_KEY`，可设置支持图片输入与 JSON 输出的 `OPENAI_MODEL`，默认 `gpt-4.1-mini`。密钥仅由服务端读取。运行环境须允许访问 `https://api.openai.com`，代理环境使用继承的网络代理。

**没有密钥时不会识别图片内容**，仅按创作参数生成模板草案，人物外观和具体服装细节需要补充。启用 AI 后，服务器将两张图片传给模型，分析可见特征并生成五分镜；结果仍需人工核对。当前未配置真实密钥，未验证真实模型调用。

图片保存在浏览器内存与本次请求中，不写入服务器磁盘。刷新会清空素材和结果，请先导出方案。请使用有权使用的参考素材。

## 项目结构

```text
fashion-video-workflow/
├── public/                   # 中文网页
│   ├── index.html
│   ├── style.css
│   └── app.js
├── src/
│   ├── app.js                # HTTP 路由、校验、安全响应头与限流
│   ├── services/
│   │   ├── planner.js        # 模板、参数和结果结构校验
│   │   └── analysis.js       # 可选视觉 AI 策划
│   └── providers/
│       └── index.js          # 可灵、即梦、其他供应商预留适配器
├── test/                     # 策划与接口测试
├── docs/API.md               # API 契约和接入指南
├── server.js                 # 服务入口
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 视频服务扩展

详见 [API 接口说明](docs/API.md)。

- `GET /api/video/providers`：列出供应商与配置状态。
- `POST /api/video/tasks`：预留生成任务提交。
- `GET /api/video/tasks/:provider/:taskId`：预留生成进度查询。

当前三类服务均未接入，有效生成请求明确返回 `501 PROVIDER_NOT_CONFIGURED`。后续实现供应商的 `submit` 和 `getTask`，可复用前端与路由契约。具体模型、鉴权与参数应依据各服务商官方文档实现。

## 当前边界

本阶段不包含成片生成、拼接、素材持久化或用户账户。服务监听 `0.0.0.0:3000`，可通过 `PORT` 修改；适合本地开发。已提供请求大小限制、基础限流和安全响应头；公开部署需进一步加入认证、费用配额与任务存储。
