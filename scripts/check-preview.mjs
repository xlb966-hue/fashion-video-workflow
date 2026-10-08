import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const base = process.argv[2] || 'http://127.0.0.1:3000';
try {
  for (const name of ['next', 'react', 'react-dom', 'tailwindcss', '@tailwindcss/postcss']) {
    require.resolve(name);
    let version = '已安装';
    try { version = require(`${name}/package.json`).version; } catch { /* 部分依赖不导出 package.json */ }
    console.log(`依赖 ${name}: ${version}`);
  }
  const home = await fetch(new URL('/', base), { signal: AbortSignal.timeout(15000) });
  if (!home.ok) throw new Error(`首页 HTTP ${home.status}`);
  const html = await home.text();
  if (!html.includes('Fashion Video Studio') || !html.includes('参考素材')) throw new Error('端口上的页面不是 Fashion Video Studio');
  const response = await fetch(new URL('/api/analysis', base), { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`分析接口 HTTP ${response.status}`);
  const status = await response.json();
  if (status.status !== 'pending' || status.configured !== false) throw new Error('分析接口状态与当前阶段不符');
  console.log(`通过：${base} 首页和 API 正常。`);
  console.log('注意：云端 localhost 不等于你的电脑；外部浏览器需要端口转发 URL。');
} catch (error) {
  console.error(`预览检查失败：${error.message}`);
  console.error('先运行 npm ci，再运行 npm run dev；端口占用时检查启动日志。');
  process.exitCode = 1;
}
