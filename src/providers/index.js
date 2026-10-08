/**
 * 视频供应商统一契约。接入时实现 submit 和 getTask；密钥只从服务端读取。
 * submit({plan, ratio, referenceImages}) -> {taskId, status}
 * getTask(taskId) -> {taskId, status, videoUrl?, error?}
 * status: queued | running | succeeded | failed
 */
export class ProviderNotConfiguredError extends Error {
  constructor(provider) {
    super(`${provider} 视频生成服务尚未接入`);
    this.code = 'PROVIDER_NOT_CONFIGURED';
    this.status = 501;
  }
}
function reserved(id, name) {
  return Object.freeze({
    id, name, configured: false,
    async submit() { throw new ProviderNotConfiguredError(id); },
    async getTask() { throw new ProviderNotConfiguredError(id); },
  });
}
// 后续将 reserved 替换为真实适配器，保持路由与前端契约不变。
export const providers = Object.freeze({
  kling: reserved('kling', '可灵'),
  jimeng: reserved('jimeng', '即梦'),
  custom: reserved('custom', '其他视频服务'),
});
export function getProvider(id) {
  if (!Object.hasOwn(providers, id)) {
    const error = new Error('不支持的视频服务');
    error.status = 400;
    error.code = 'INVALID_PROVIDER';
    throw error;
  }
  return providers[id];
}
