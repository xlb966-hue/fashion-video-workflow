'use client';
import type { Analysis } from '@/types/workflow';
import { analysisFields } from '@/lib/workflow';
export default function AnalysisEditor({value,onChange}:{value:Analysis;onChange:(next:Analysis)=>void}){
 return <div className="mt-6 grid gap-6 xl:grid-cols-3">{(Object.keys(analysisFields) as (keyof Analysis)[]).map((group,index)=><div key={group} className="rounded-lg border border-[#e6eadf] bg-[#fcfdf9] p-4"><h3 className="mb-4 flex items-center gap-2 text-sm font-medium"><span className="text-xs text-[#98a889]">0{index+1}</span>{{person:'人物设定',clothing:'服装细节',scene:'场景氛围'}[group]}</h3><div className="space-y-4">{Object.entries(analysisFields[group]).map(([key,label])=><label key={key} className="block text-xs text-[#66745c]">{label}<textarea className="field mt-2 min-h-18" placeholder="待分析，请根据参考图手动填写" value={(value[group] as unknown as Record<string,string>)[key]} onChange={e=>onChange({...value,[group]:{...value[group],[key]:e.target.value}})}/></label>)}</div></div>)}</div>;
}
