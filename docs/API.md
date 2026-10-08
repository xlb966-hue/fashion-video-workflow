# Fashion Video Studio API

第一阶段只提供结构化契约。不存在模拟视频成功结果，所有视频适配器 `configured: false`。接口不要求 API Key。

## 视觉分析

`GET /api/analysis`：

```json
{"configured":false,"status":"pending","message":"尚未接入视觉模型，支持手动编辑，未执行图片识别"}
```

`POST /api/analysis` → HTTP **501**，`code: VISION_NOT_CONFIGURED`，`status: pending`。当前不处理或上传图片。

后续实现时使用 `Analysis`（`src/types/workflow.ts`）作为输出数据结构：

- `person`: `face`, `hair`, `skin`, `expression`
- `clothing`: `category`, `color`, `neckline`, `waist`, `fabric`, `accessories`
- `scene`: `architecture`, `light`, `photography`, `palette`

真实模型返回并通过校验后才允许 `analysisStatus: ai`；失败或无配置保持 pending，用户输入标记 manual。

## 视频供应商

`GET /api/video/providers` 返回可灵 `kling`、即梦 `jimeng`、Sora `sora` 与其他 `custom`，每项包含 `id/name/configured`。

`POST /api/video/tasks`：

```typescript
{
  provider: 'kling' | 'jimeng' | 'sora' | 'custom';
  workflow: Workflow; // 使用完整导出 JSON，五镜头总时长需为 15 秒
  referenceImages?: { clothing?: string; person?: string };
}
```

当前使用本地预览，导出 JSON 不含图片二进制。后续接入服务时，应将 `referenceImages` 改为权限受控的素材引用；当前没有素材上传接口。请求体上限 256,000 字符，适用于策划文字，不适用于原始图片。

有效请求返回 HTTP **501**：

```json
{"code":"PROVIDER_NOT_CONFIGURED","error":"kling 视频服务尚未接入，当前未创建生成任务","actualVideoGenerated":false}
```

`GET /api/video/tasks/:provider/:taskId`：预留查询接口，当前同样 501；未知服务 400。

后续真实任务契约：

```typescript
interface VideoTask {
  source: 'real';
  taskId: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  videoUrl?: string;
  error?: string;
}
```

适配器实现 `submit(input: VideoRequest): Promise<VideoTask>` 与 `getTask(taskId: string): Promise<VideoTask>`。真实提交后返回 202；只有官方任务查询确认并验证输出视频后才显示 succeeded。不得用固定模拟链接替代真实文件。

各服务商分辨率、时长、参考图能力和鉴权不同，需要依照官方文档适配，不假设通用端点。跨镜头编排和 MP4 拼接属于后续独立流程。

## 错误状态

- 400：未知服务、损坏的 JSON、工作流不完整或时长不符合 15 秒。
- 413：策划请求过大。
- 501：供应商 / 视觉服务尚未接入。
- 502：未来真实供应商调用异常。
