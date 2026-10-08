'use client';
import { useEffect,useRef,useState } from 'react';
import { Upload,Trash2,Shirt,UserRound } from 'lucide-react';
export default function ImageUpload({kind,title,subtitle,onChange}:{kind:'clothing'|'person';title:string;subtitle:string;onChange:(present:boolean)=>void}){
 const [preview,setPreview]=useState(''),[name,setName]=useState(''),[error,setError]=useState(''),[drag,setDrag]=useState(false);
 const input=useRef<HTMLInputElement>(null),sequence=useRef(0);
 useEffect(()=>()=>{if(preview)URL.revokeObjectURL(preview);},[preview]);
 async function select(file?:File){
  if(!file)return;
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){setError('仅支持 JPG、PNG、WEBP');return;}
  if(file.size>5*1024*1024){setError('每张图片最大 5 MB');return;}
  const token=++sequence.current,url=URL.createObjectURL(file);
  try{await new Promise<void>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve();image.onerror=reject;image.src=url;});if(sequence.current!==token){URL.revokeObjectURL(url);return;}setPreview(url);setName(file.name);setError('');onChange(true);}
  catch{URL.revokeObjectURL(url);if(sequence.current===token)setError('图片无法解码，请选择有效图片');}
 }
 function remove(){sequence.current++;setPreview('');setName('');setError('');if(input.current)input.current.value='';onChange(false);}
 const Icon=kind==='clothing'?Shirt:UserRound;
 return <div><div className="mb-3 flex items-center gap-2 text-sm font-medium"><Icon size={16}/>{title}</div><label onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);void select(e.dataTransfer.files[0]);}} className={`relative flex h-64 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border border-dashed ${drag?'border-[#718d58] bg-[#eef4e7]':'border-[#ced8c3] bg-[#f9faf6]'} hover:border-[#78945e]`}>
 <input ref={input} type="file" aria-label={title} accept="image/jpeg,image/png,image/webp" className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" onChange={e=>{void select(e.target.files?.[0]);e.target.value='';}}/>
 {preview?<img src={preview} alt={`${title}预览`} className="h-full w-full object-contain p-3"/>:<><div className="mb-5 rounded-full bg-[#edf2e6] p-4 text-[#82986c]"><Upload size={24} strokeWidth={1.5}/></div><strong className="text-sm font-medium">点击上传或拖拽图片</strong><span className="mt-2 text-xs text-[#9aa48e]">{subtitle}</span></>}
 </label><div className="mt-3 flex min-h-6 items-center justify-between gap-2"><span className="truncate text-[11px] text-[#8b957f]">{name||'JPG / PNG / WEBP · 最大 5 MB'}</span>{preview&&<button className="flex shrink-0 items-center gap-1 text-xs text-[#9b6c55]" onClick={remove} aria-label={`删除${title}`}><Trash2 size={13}/>删除</button>}</div>{error&&<p role="alert" className="text-xs text-red-700">{error}</p>}</div>;
}
