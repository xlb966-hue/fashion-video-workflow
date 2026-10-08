import type { Workflow } from '../types/workflow';
import { analysisFields, consistencyLabels, timeRanges, totalDuration } from './workflow';
export function exportJson(w: Workflow) { return JSON.stringify({...w,source:'planning-template',actualVideoGenerated:false},null,2); }
export function exportPrompts(w: Workflow) { const ranges=timeRanges(w.shots);return w.shots.map((s,i)=>`镜头 ${i+1}：${s.name}（${ranges[i]}）\n\n中文提示词\n${s.promptZh}\n\nEnglish prompt\n${s.promptEn}\n\n负面提示词 / Negative prompt\n${s.negative}`).join('\n\n────────────────────\n\n'); }
export function exportDocument(w: Workflow) {
 const ranges=timeRanges(w.shots);
 const sections = Object.entries(w.analysis).map(([group,values])=>`### ${{person:'人物',clothing:'服装',scene:'场景'}[group]}\n\n`+Object.entries(values).map(([key,value])=>`- ${analysisFields[group as keyof typeof analysisFields][key as never]}：${value||'待填写 / 待分析'}`).join('\n')).join('\n\n');
 return `# ${w.name}\n\nFashion Video Studio · 分镜规划\n\n画面：${w.aspectRatio} | 规划时长：${totalDuration(w.shots)} 秒 | 目标：15 秒\n\n分析状态：${w.analysisStatus==='pending'?'待分析':w.analysisStatus==='manual'?'手动编辑':'AI 分析'}\n\n本文件为视频策划文档，未生成真实视频。\n\n## 结构化设定\n\n${sections}\n\n## 一致性要求\n\n${Object.entries(w.consistency).filter(([,v])=>v).map(([k])=>`- ${consistencyLabels[k as keyof typeof consistencyLabels]}`).join('\n')}\n\n## 五个镜头\n\n${w.shots.map((s,i)=>`### 镜头 ${i+1}：${s.name}（${ranges[i]}）\n\n- 人物动作：${s.action}\n- 摄影机：${s.camera}\n- 展示重点：${s.focus}\n\n**中文提示词**\n\n${s.promptZh}\n\n**英文提示词**\n\n${s.promptEn}\n\n**负面提示词**\n\n${s.negative}`).join('\n\n')}`;
}
