import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { template } from '../src/services/planner.js';
const input = { clothing: 'data:image/png;base64,YQ==', face: 'data:image/jpeg;base64,YQ==', style: '极简高级', scene: '简约摄影棚', brief: '', duration: 30, ratio: '9:16' };
test('页面、健康检查与服务列表可访问', async () => {
 const app = createApp();
 assert.equal((await request(app).get('/')).status, 200);
 assert.equal((await request(app).get('/api/health')).body.status, 'ok');
 const list = await request(app).get('/api/video/providers');
 assert.deepEqual(list.body.providers.map(p => p.id), ['kling', 'jimeng', 'custom']);
 assert.ok(list.body.providers.every(p => p.configured === false));
});
test('模板生成返回五分镜，错误请求返回400', async () => {
 const previous = process.env.OPENAI_API_KEY; delete process.env.OPENAI_API_KEY;
 try {
  const app = createApp();
  const result = await request(app).post('/api/plan').send(input);
  assert.equal(result.status, 200); assert.equal(result.body.mode, 'template'); assert.equal(result.body.plan.shots.length, 5);
  assert.equal((await request(app).post('/api/plan').send({})).status, 400);
  assert.equal((await request(app).post('/api/plan').set('Content-Type', 'application/json').send('{')).status, 400);
 } finally { if (previous !== undefined) process.env.OPENAI_API_KEY = previous; }
});
test('视频 API 明确返回未接入，拒绝未知供应商和无效方案', async () => {
 const app = createApp();
 for (const provider of ['kling', 'jimeng', 'custom']) {
  const result = await request(app).post('/api/video/tasks').send({ provider, plan: template(input), ratio: '9:16' });
  assert.equal(result.status, 501); assert.equal(result.body.code, 'PROVIDER_NOT_CONFIGURED');
  assert.equal((await request(app).get(`/api/video/tasks/${provider}/example`)).status, 501);
 }
 assert.equal((await request(app).post('/api/video/tasks').send({ provider: 'unknown' })).status, 400);
 assert.equal((await request(app).post('/api/video/tasks').send({ provider: 'kling', plan: {} })).status, 400);
});
