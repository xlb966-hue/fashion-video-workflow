import { createApp } from './src/app.js';
const port = Number(process.env.PORT) || 3000;
const server = createApp().listen(port, '0.0.0.0', () => console.log(`织映工作台：http://localhost:${port}`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
