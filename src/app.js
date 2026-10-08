import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { validate, template, validPlan } from './services/planner.js';
import { analyze } from './services/analysis.js';
import { providers, getProvider } from './providers/index.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use('/api', (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); });
  app.use('/api', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: '请求过于频繁，请稍后重试' } }));
  app.use(express.json({ limit: '15mb' }));
  app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
  app.get('/api/status', (req, res) => res.json({ mode: process.env.OPENAI_API_KEY ? 'ai' : 'template' }));
  app.post('/api/plan', async (req, res) => {
    try { validate(req.body ?? {}); }
    catch (error) { return res.status(400).json({ error: error.message }); }
    if (!process.env.OPENAI_API_KEY) return res.json({ mode: 'template', plan: template(req.body) });
    try { return res.json({ mode: 'ai', plan: await analyze(req.body) }); }
    catch (error) { return res.status(502).json({ error: error.name === 'TimeoutError' ? '生成超时，请重试' : 'AI 分析失败，请检查服务端密钥、模型与网络配置后重试' }); }
  });
  app.get('/api/video/providers', (req, res) => res.json({ providers: Object.values(providers).map(({ id, name, configured }) => ({ id, name, configured })) }));
  app.post('/api/video/tasks', async (req, res) => {
    const { provider, plan, ratio } = req.body ?? {};
    const adapter = getProvider(provider);
    if (!validPlan(plan) || !['9:16', '16:9', '1:1'].includes(ratio)) return res.status(400).json({ code: 'INVALID_VIDEO_REQUEST', error: '请提供完整的五分镜方案和有效画面比例' });
    const task = await adapter.submit({ plan, ratio, referenceImages: req.body.referenceImages });
    res.status(202).json({ provider, ...task });
  });
  app.get('/api/video/tasks/:provider/:taskId', async (req, res) => {
    const adapter = getProvider(req.params.provider);
    res.json({ provider: req.params.provider, ...await adapter.getTask(req.params.taskId) });
  });
  app.use(express.static(new URL('../public', import.meta.url).pathname));
  app.use((req, res) => res.status(404).json({ error: '页面或接口不存在' }));
  app.use((error, req, res, next) => {
    if (error.type === 'entity.too.large') return res.status(413).json({ error: '图片过大，请压缩后重试' });
    if (error.type === 'entity.parse.failed') return res.status(400).json({ error: '请求必须是有效的 JSON' });
    res.status(error.status || 500).json({ code: error.code || 'INTERNAL_ERROR', error: error.status ? error.message : '服务暂时不可用，请重试' });
  });
  return app;
}
