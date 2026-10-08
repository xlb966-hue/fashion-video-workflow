import type { Analysis, Consistency, Shot, Workflow } from '../types/workflow';
export const analysisFields = {
  person: { face: '脸部特征', hair: '发型与发色', skin: '肤色与妆容', expression: '表情和气质' },
  clothing: { category: '服装品类', color: '颜色和图案', neckline: '领型与袖型', waist: '腰线与裙摆', fabric: '面料与纹理', accessories: '配饰和搭配' },
  scene: { architecture: '建筑背景', light: '自然光线', photography: '摄影风格', palette: '色彩氛围' },
} as const;
export const consistencyLabels: Record<keyof Consistency, string> = {
 face: '人脸与发型以人物参考图为准', clothing: '服装款式、颜色、纹理与细节以服装图为准', anatomy: '保持正常人体比例', light: '真实自然光，保留肌肤质感，避免过度磨皮', gait: '自然步态，避免僵硬摆拍', stability: '防止服装变形、图案变化与面部漂移',
};
const englishRules: Record<keyof Consistency, string> = {
 face: 'Match the face and hairstyle to the person reference image.', clothing: 'Match the garment design, colors, textures and details to the clothing reference image.', anatomy: 'Maintain realistic human proportions.', light: 'Use realistic natural light and authentic skin texture; avoid excessive skin smoothing.', gait: 'Use a natural gait and relaxed poses.', stability: 'Keep facial identity, garment geometry and patterns stable across frames.',
};
export const emptyAnalysis = (): Analysis => ({ person: {face:'',hair:'',skin:'',expression:''}, clothing:{category:'',color:'',neckline:'',waist:'',fabric:'',accessories:''}, scene:{architecture:'',light:'',photography:'',palette:''} });
export const defaultConsistency = (): Consistency => ({face:true,clothing:true,anatomy:true,light:true,gait:true,stability:true});
export function generateShots(analysis: Analysis, consistency: Consistency): Shot[] {
 const base = [
  ['全身站姿',3,'模特正面全身自然站立，身体放松，轻微调整重心','摄影机位于人物正前方，全身景别，缓慢推进','整体廓形、服装长度与搭配','Full-body standing pose','Stand naturally facing the camera with relaxed posture and a subtle weight shift.','Front-facing full-body view, slow dolly-in.','Show the overall silhouette, garment length and styling.'],
  ['服装细节',2,'人物轻触服装边缘，以自然小幅动作展示细节','近景特写，缓慢横移，避免裁切关键服装部位','面料纹理、领口、袖口与工艺细节','Garment details','Gently touch the garment edge to reveal its details.','Close-up with a slow lateral slide; keep key garment details visible.','Highlight fabric texture, neckline, cuffs and construction.'],
  ['自然行走',4,'人物向前自然行走，手臂轻摆，服装随步态自然摆动','摄影机位于正前方，平视向后跟拍','动态垂坠、服装线条与自然步态','Natural walking','Walk forward naturally with relaxed arm movement and realistic fabric motion.','Eye-level front tracking shot, camera moving backward.','Show fabric drape, garment lines and natural movement.'],
  ['侧身展示',3,'人物缓慢转为侧身，停留片刻展示轮廓','摄影机平视，中全景，轻微环绕','侧面版型、腰线与裙摆轮廓','Side profile','Turn gently into a side profile and pause to show the silhouette.','Eye-level medium-full shot with a subtle orbit.','Show the side cut, waistline and hem shape.'],
  ['正面收尾',3,'人物转回正面，自然微笑，保持完整造型定格','摄影机正前方，全身景别，缓慢拉远后稳定','正面完整造型与品牌展示空间','Front-facing finale','Return to face the camera, smile naturally and hold the complete look.','Front-facing full-body view, slowly pull back and settle.','Show the complete front look with space for branding.'],
 ] as const;
 const details = Object.entries(analysis).flatMap(([group, values])=>Object.entries(values).filter(([,v])=>typeof v==='string'&&v.trim()).map(([key,value])=>`${analysisFields[group as keyof Analysis][key as never]}：${value}`)).join('；');
 const rules = Object.entries(consistency).filter(([,enabled])=>enabled).map(([key])=>consistencyLabels[key as keyof Consistency]).join('；');
 const enRules = Object.entries(consistency).filter(([,enabled])=>enabled).map(([key])=>englishRules[key as keyof Consistency]).join(' ');
 return base.map((s,i)=>({id:i+1,name:s[0],duration:s[1],action:s[2],camera:s[3],focus:s[4],promptZh:`写实女装展示视频，9:16竖屏。${s[2]}。${s[3]}。重点展示：${s[4]}。${details ? `已填写设定：${details}。` : '具体人物与服装外观以参考图为准，尚未进行图片识别。'}一致性要求：${rules}。`,promptEn:`Photorealistic womenswear showcase, vertical 9:16. ${s[6]} ${s[7]} ${s[8]} ${enRules} Use the supplied reference images as the visual source.`,negative:'面部漂移，身份变化，发型变化，服装变形，颜色偏移，图案变化，肢体畸形，多余手指，不自然步态，僵硬摆拍，过度磨皮，闪烁，模糊，水印 / face drift, identity change, hairstyle changes, garment distortion, color shifts, pattern changes, deformed anatomy, extra fingers, unnatural gait, stiff poses, excessive skin smoothing, flicker, blur, watermark'}));
}
export function createWorkflow(): Workflow {
 const analysis=emptyAnalysis(),consistency=defaultConsistency();
 return {version:1,name:'我的女装展示项目',aspectRatio:'9:16',duration:15,analysisStatus:'pending',analysis,consistency,shots:generateShots(analysis,consistency)};
}
export function totalDuration(shots: Shot[]) { return Math.round(shots.reduce((sum,s)=>sum+s.duration,0)*1000)/1000; }
export function timeRanges(shots: Shot[]) { let start=0;return shots.map(s=>{const end=Math.round((start+s.duration)*1000)/1000;const range=`${start}–${end} 秒`;start=end;return range;}); }
export function isWorkflow(value: unknown): value is Workflow {
 if(!value || typeof value!=='object')return false;
 const w=value as Workflow;
 if(w.version!==1 || typeof w.name!=='string' || w.aspectRatio!=='9:16' || w.duration!==15 || !['pending','manual','ai'].includes(w.analysisStatus))return false;
 if(!w.analysis || !w.consistency || !Array.isArray(w.shots) || w.shots.length!==5)return false;
 for(const group of Object.keys(analysisFields) as (keyof Analysis)[])for(const key of Object.keys(analysisFields[group]))if(typeof (w.analysis[group] as unknown as Record<string,unknown>)?.[key]!=='string')return false;
 if(!Object.keys(consistencyLabels).every(k=>typeof w.consistency[k as keyof Consistency]==='boolean'))return false;
 return new Set(w.shots.map(s=>s?.id)).size===5 && w.shots.every(s=>s && typeof s==='object' && Number.isInteger(s.id)&& typeof s.duration==='number'&&Number.isFinite(s.duration)&&s.duration>0&&['name','action','camera','focus','promptZh','promptEn','negative'].every(k=>typeof s[k as keyof Shot]==='string'));
}
