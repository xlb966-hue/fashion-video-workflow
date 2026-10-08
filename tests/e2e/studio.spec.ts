import {test,expect} from '@playwright/test';
import {createWorkflow} from '../../src/lib/workflow';
test('上传、删除、手动分析、镜头编辑、刷新草稿和导出',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'参考素材',exact:true})).toBeVisible();
 const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jS1sAAAAASUVORK5CYII=','base64');
 await page.getByLabel('服装参考图',{exact:true}).setInputFiles({name:'dress.png',mimeType:'image/png',buffer:png});
 await expect(page.getByAltText('服装参考图预览')).toBeVisible();
 await page.getByRole('button',{name:'删除服装参考图'}).click();await expect(page.getByAltText('服装参考图预览')).toHaveCount(0);
 await page.getByLabel('人物参考图',{exact:true}).setInputFiles({name:'face.png',mimeType:'image/png',buffer:png});await expect(page.getByAltText('人物参考图预览')).toBeVisible();
 await page.getByLabel('颜色和图案',{exact:true}).fill('奶油白，无图案');await page.getByRole('button',{name:'按当前设定重新生成'}).click();
 await expect(page.getByLabel('中文提示词',{exact:true}).first()).toContainText('奶油白');
 await page.getByLabel('英文提示词',{exact:true}).first().fill('My edited English prompt');
 await page.reload();await expect(page.getByLabel('英文提示词',{exact:true}).first()).toHaveValue('My edited English prompt');await expect(page.getByAltText('人物参考图预览')).toHaveCount(0);
 for(const [name,extension] of [['完整分镜 JSON','.json'],['中英文提示词 TXT','.txt'],['分镜规划文档','.md']]){const pending=page.waitForEvent('download');await page.getByRole('button',{name,exact:true}).click();expect((await pending).suggestedFilename()).toContain(extension);}
 await expect(page.getByRole('button',{name:'视频生成 · 尚未接入'})).toBeDisabled();
});
test('API 保持待分析、未接入状态并拒绝坏参数',async({request})=>{
 expect((await request.get('/api/analysis')).status()).toBe(200);
 expect((await request.post('/api/analysis')).status()).toBe(501);
 const result=await request.post('/api/video/tasks',{data:{provider:'sora',workflow:createWorkflow()}});expect(result.status()).toBe(501);expect((await result.json()).actualVideoGenerated).toBe(false);
 expect((await request.post('/api/video/tasks',{data:{provider:'unknown'}})).status()).toBe(400);
 expect((await request.get('/api/video/tasks/kling/test')).status()).toBe(501);
});
