# Fashion Video Studio

中文 AI 女装视频工作流网页，基于 **Next.js App Router、TypeScript、Tailwind CSS**。第一阶段完成前期策划与导出，无需 API Key。

## 已实现

- 服装和人物两个独立上传区：JPG、PNG、WEBP；缩略图、拖拽、删除和重新上传，单张最大 5 MB。
- 可编辑人物 4 项、服装 6 项、场景 4 项结构化设定。默认是“待分析”，手动输入后标记“手动编辑”，未执行真实图片识别。
- 15 秒、9:16 五镜头：全身站姿 0–3 秒、细节 3–5 秒、行走 5–9 秒、侧身 9–12 秒、收尾 12–15 秒。
- 每镜头可编辑名称、时长、动作、摄影机、展示重点、中英文提示词和负面提示词。可复制单项或全部提示词。
- 六项人物与服装一致性约束，按当前设定重新生成模板时写入中英文提示词。
- 导出完整分镜 JSON、中英文提示词 TXT、Markdown 分镜规划文档。
- 本浏览器自动保存文字草稿，刷新恢复；参考图片不持久化，不发送至外部服务。
- 可灵、即梦、Sora 和其他服务统一适配接口；未接入时返回 HTTP 501，绝不显示虚假生成成功。

## 安装与启动

需要 Node.js **22.13+**（已在 Node.js 24 上验证）及 npm。

```bash
git clone -b work https://github.com/xlb966-hue/fashion-video-workflow.git
cd fashion-video-workflow
npm ci
cp .env.example .env.local  # 可选，本阶段无需密钥
npm run dev
```

在桌面浏览器访问 **http://localhost:3000**。如果端口被占用：

```bash
npm run dev -- --port 3001
```

生产构建与预览：

```bash
npm run build
npm start
```

Next.js 自动读取 `.env.local`，修改后需重启。不要将未来服务商密钥放入 `NEXT_PUBLIC_` 变量。

## 推荐操作顺序

1. 上传两张参考图。
2. 按图片填写人物、服装、场景信息；不要将“待分析”误认为模型识别结果。
3. 勾选一致性要求。
4. 点击“按当前设定重新生成”，获得五镜头模板；此操作覆盖镜头编辑。
5. 按需编辑各镜头。中文手动设定会写入中文提示词；英文提示词为参考图导向的模板，**不会自动翻译中文自定义描述**，请手动补充英文。
6. 检查总时长为 15 秒，复制提示词或导出三个格式。

当前未实现真实视频播放、MP4 输出或合成。浏览器禁止剪贴板访问时，页面提示手动复制或导出 TXT。

## 项目结构

```text
src/
├── app/
│   ├── page.tsx / layout.tsx / globals.css
│   └── api/
│       ├── analysis/route.ts
│       └── video/
│           ├── providers/route.ts
│           └── tasks/route.ts / [provider]/[taskId]/route.ts
├── components/
│   ├── Studio.tsx             # 工作台与草稿
│   ├── ImageUpload.tsx        # 文件校验与本地预览
│   ├── AnalysisEditor.tsx     # 结构化分析编辑器
│   └── ShotEditor.tsx         # 分镜与提示词编辑器
├── lib/
│   ├── workflow.ts            # 默认模板、时间轴、校验
│   ├── export.ts              # JSON / TXT / Markdown
│   └── providers.ts           # 视频服务适配器契约
└── types/workflow.ts          # 工作流与任务类型
tests/
├── workflow.test.ts           # 基础规则与导出测试
└── e2e/studio.spec.ts          # 浏览器交互与 API 测试
docs/API.md
```

## 检查与测试

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium  # 首次运行浏览器测试时安装
npm run test:e2e                 # 自动在 3100 端口启动生产预览
```

基础测试覆盖默认分镜时间、一致性、导出、草稿校验和未接入供应商行为。浏览器测试覆盖上传、删除、结构化编辑、镜头编辑、刷新恢复、三种下载与真实状态 API。

## 后续 API 接入

详见 [API 文档](docs/API.md)。当前没有视觉或视频 API 调用，也不要求密钥。未来需要：

- 视觉模型：将 `api/analysis` 替换为真实图片分析，校验结果后才将状态改为 `ai`。
- 视频模型：在 `lib/providers.ts` 实现 `VideoAdapter.submit/getTask`，依据最新官方文档转换服务商参数、处理任务状态。
- 自动翻译：接入翻译/语言模型处理中文自定义设定。
- 视频合成：真实单镜头生成后接入下载、校验和 MP4 拼接流程。

第一阶段为本地策划工具。公开部署及真实付费生成前，应加入认证、额度、请求限流、私有素材存储、持久化任务和安全回调校验。

## 提交到 GitHub

```bash
git status
git add .
git commit -m "Build Fashion Video Studio workflow application"
git push origin work
```

当前工作分支为 `work`。`.gitignore` 已忽略依赖、构建结果、环境变量和测试产物。

## 无法打开“网页预览”？

详细操作与原因说明见 [网页预览指南](docs/PREVIEW.md)。云端的 `localhost:3000` 不是你电脑的地址，必须通过平台的端口转发访问。

本项目已配置 GitHub Codespaces：在 **work** 分支点击 **Code → Codespaces → Create codespace on work**，启动后在 **Ports / 端口** 面板点击 **3000** 行的 **Open in Browser**。本地则运行 `npm ci && npm run dev`，打开 http://localhost:3000 。

开发及生产启动默认明确监听 `0.0.0.0:3000`。服务运行后使用 `npm run preview:check` 检查依赖、首页与接口。Codex 云端任务的进程不等于持久托管；没有转发入口时使用 Codespaces 或本地预览。
