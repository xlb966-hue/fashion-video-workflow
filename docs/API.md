# API 接口说明

所有请求与响应使用 JSON；当前仅提供策划和视频服务扩展契约，不调用任何视频生成平台。

## 图片分析与策划

`GET /api/health` → `{ "status": "ok" }`

`GET /api/status` → `{ "mode": "template" }` 或 `{ "mode": "ai" }`。

`POST /api/plan`：

```json
{
  "clothing": "data:image/jpeg;base64,...",
  "face": "data:image/png;base64,...",
  "style": "极简高级",
  "scene": "简约摄影棚",
  "brief": "突出轻盈质感",
  "ratio": "9:16",
  "duration": 30
}
```

图片支持 JPEG、PNG、WebP，每张不超过 5MB。`brief` 可为空；比例支持 `9:16`、`16:9`、`1:1`；时长支持 15、30、60 秒。成功响应：

```json
{
  "mode": "template",
  "plan": {
    "character": "人物设定",
    "clothing": "服装细节",
    "scene": "场景与氛围",
    "shots": [
      { "title": "氛围开场", "time": "0–6 秒", "camera": "远景 · 推进", "action": "人物走入", "prompt": "视频模型提示词" }
    ]
  }
}
```

这里为简洁仅展示一个镜头，实际返回恰好 5 个。没有配置 AI 密钥时返回模板，不会识别图片。

## 视频供应商预留接口

`GET /api/video/providers` 返回 `kling`（可灵）、`jimeng`（即梦）、`custom`（其他服务）。当前全部 `configured: false`。

`POST /api/video/tasks`：

```json
{
  "provider": "kling",
  "ratio": "9:16",
  "plan": { "character": "...", "clothing": "...", "scene": "...", "shots": [] },
  "referenceImages": { "clothing": "...", "face": "..." }
}
```

提交时 `plan` 必须包含完整的五个镜头；上面的空数组仅是字段示意。当前有效请求返回 **HTTP 501**：

```json
{ "code": "PROVIDER_NOT_CONFIGURED", "error": "kling 视频生成服务尚未接入" }
```

`GET /api/video/tasks/:provider/:taskId` 预留任务查询接口，当前同样返回 501，不创建虚假任务。

未来适配器成功提交后应返回 HTTP 202 和 `{ provider, taskId, status }`；查询返回 `{ provider, taskId, status, videoUrl?, error? }`。状态统一为 `queued`、`running`、`succeeded`、`failed`。

## 接入真实视频服务

1. 在 `src/providers/` 新建适配器，实现 `submit({ plan, ratio, referenceImages })` 和 `getTask(taskId)`。
2. 在 `src/providers/index.js` 注册适配器。检查密钥与配置后设置 `configured`，仅在服务端读取凭证。
3. 根据服务商最新官方文档转换提示词、参考图片、支持的比例和时长；不能假设可灵、即梦接口相同。
4. 将跨镜头一致性设定加入各镜头提示词。供应商只支持单镜头时，需要任务编排与后续视频拼接层。
5. 在真实接入前增加持久化任务存储、鉴权、幂等提交、额度控制与超时处理。若使用回调，应验证签名。

## 通用错误

400：参数错误 / JSON 无效；413：请求过大；429：每 IP 每分钟最多 20 次 API 请求；501：视频服务未接入；502：AI 分析失败；500：内部错误。错误响应包含 `error`，部分带稳定的 `code`。
