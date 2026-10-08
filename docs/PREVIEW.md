# 网页预览排查与可用入口

## 已确认的原因与边界

在当前 Codex 云端环境中，Next.js 已监听 `0.0.0.0:3000`，首页及 API 可访问。内部 HTTP 可用不等于网页预览按钮已经绑定到该端口。当前会话没有提供可设置端口转发的工具，也没有返回可验证的外部预览 URL；无法从此会话确认按钮的目标地址或修改其绑定。

`http://localhost:3000` 是**正在运行项目的机器**的地址。将云端的 localhost 链接在自己的电脑打开，不会自动访问云端服务。`0.0.0.0` 是监听地址，不是应该点击的外部网站地址。

云端任务中的服务目前可运行，但环境暂停、回收或重启后，不保证进程继续存活。不要把执行会话中的后台进程当成持久网站托管。

## 入口一：GitHub Codespaces（不需要本地安装）

本仓库包含 `.devcontainer/devcontainer.json`：Node.js 24、自动 `npm ci`、启动开发服务并转发 **3000** 端口。

1. 打开仓库，选择 **work** 分支。
2. 点击绿色 **Code → Codespaces → Create codespace on work**。需要 GitHub 账户具备 Codespaces 使用权限和额度。
3. 等待创建、依赖安装与启动完成。
4. 底部点击 **Ports / 端口**，找到 **3000 / Fashion Video Studio**。
5. 点击该行的 **Open in Browser / 在浏览器中打开** 图标（地球图标），或点击该行转发地址。

实际地址由 GitHub 创建，形如 `https://<codespace-name>-3000.app.github.dev`，不要自己猜测地址。端口可保持 Private / 私有，无需公开。

若没有自动打开，在 Codespaces 终端运行：

```bash
npm run dev
```

若 3000 行不存在，点击 **Add Port / 添加端口**，填写 `3000`。自动启动日志位于 `/tmp/fashion-video-studio-preview.log`。已有 Codespace 需要执行 **Codespaces: Rebuild Container** 才应用新增的 devcontainer 配置。

## 入口二：本地浏览器

在你自己的电脑终端执行：

```bash
git clone -b work https://github.com/xlb966-hue/fashion-video-workflow.git
cd fashion-video-workflow
npm ci
npm run dev
```

终端显示 Ready 后，打开 **http://localhost:3000**，保持该终端运行。需要 Node.js 22.13+。

已经克隆的项目执行 `git pull` 即可，不必重新创建项目。

## 如果 Codex 界面有端口配置

预览端口设为 **3000**，路径为 **/**，内部 HTTP，启动命令为 **npm run dev**，工作目录为仓库根目录（本环境为 `/workspace/fashion-video-workflow`）。应点击界面提供的**转发 URL**，而不是把云端 localhost 当成外部 URL。

若界面仅有“网页预览”按钮但没有端口绑定/转发入口，且按钮仍打不开，使用上面的 Codespaces 或本地入口；项目配置不能单独创建 Codex 平台的公网转发服务。

## 检查命令

```bash
npm ls --depth=0
npm run preview:check
npm run typecheck
npm test
npm run build
```

`preview:check` 必须在服务已运行时执行，检查依赖、首页和 API。转发入口也可验证：

```bash
npm run preview:check -- https://实际转发地址
```

私有转发地址可能要求 GitHub 登录；CLI 未登录导致不可访问时，用已登录的浏览器验证。不要关闭私有访问保护来绕过登录。

## 常见错误

- `EADDRINUSE`：3000 被占用。先确认是否已经有本项目运行，不要重复启动；若是其他服务，停止它或用 `npm run dev -- --port 3001`，并将预览入口也改为 3001。
- `Could not find a production build`：`npm start` 之前执行 `npm run build`；开发预览直接 `npm run dev`。
- 缺少依赖：运行 `npm ci`，确保 Node 版本满足要求。
- 本地 HTTP 200，但外部无法访问：检查端口转发、任务是否仍运行、是否需要登录；重新构建页面不能修复平台转发链路。
- 开发资源 / 热更新受跨源限制：已配置 `127.0.0.1` 与 `*.app.github.dev` 为本地及 Codespaces 开发来源，修复本地 IP 访问时的热更新拦截。其他预览域名须依据实际转发域名单独配置，不能盲目开放所有来源。
