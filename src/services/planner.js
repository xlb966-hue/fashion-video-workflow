export function validate(input) {
  for (const key of ['clothing', 'face']) {
    if (typeof input[key] !== 'string' || !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(input[key])) throw new Error('请上传有效的 JPG、PNG 或 WebP 参考图');
    if (input[key].length > 7 * 1024 * 1024) throw new Error('每张图片不能超过 5 MB');
  }
  if (![15, 30, 60].includes(Number(input.duration))) throw new Error('视频时长无效');
  if (!['9:16','16:9','1:1'].includes(input.ratio)) throw new Error('画面比例无效');
  for (const key of ['brief','style','scene']) if (typeof input[key] !== 'string' || input[key].length > 2000) throw new Error('创作参数无效');
}
export function template(input) {
 const length = Number(input.duration) / 5;
 const titles = ['氛围开场','人物亮相','服装细节','动态展示','定格收尾'];
 const actions = ['环境空镜渐进，人物从画面远处走入','人物转向镜头，展示整体穿搭','聚焦领口、袖口与面料纹理，缓慢扫过','人物自然行走、轻转身，展示服装垂坠与轮廓','人物停步回望，以完整造型结束'];
 return { character:'以人物脸部参考图为统一角色依据；五个镜头保持脸型、五官、发型与妆容一致。具体外观待确认。', clothing:'以服装参考图为依据，保持颜色、版型、图案与配饰一致。材质、领型、袖型和工艺细节待确认。', scene:`${input.scene}；${input.style}风格，统一光线与色温。`, shots:titles.map((title,i)=>({title,time:`${i*length}–${(i+1)*length} 秒`,camera:['远景 · 缓慢推进','中景 · 平视跟拍','特写 · 横向滑轨','全景 · 环绕跟拍','中景 · 缓慢拉远'][i],action:actions[i],prompt:`${input.style}服装广告，${input.scene}，${input.ratio}构图。${actions[i]}。人物与服装严格参考上传图片，保持跨镜头一致性。${input.brief}`})) };
}
export function validPlan(plan) {
 return plan && ['character','clothing','scene'].every(k=>typeof plan[k]==='string') && Array.isArray(plan.shots) && plan.shots.length===5 && plan.shots.every(s=>['title','time','camera','action','prompt'].every(k=>typeof s[k]==='string'));
}
