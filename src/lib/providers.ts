import type { ProviderId, VideoAdapter, VideoRequest } from '../types/workflow';
export class NotConfiguredError extends Error { readonly code='PROVIDER_NOT_CONFIGURED'; constructor(id:string){super(`${id} 视频服务尚未接入，当前未创建生成任务`);} }
const reserved=(id:ProviderId,name:string):VideoAdapter=>({id,name,configured:false,async submit(){throw new NotConfiguredError(id);},async getTask(){throw new NotConfiguredError(id);}});
export const providers:Record<ProviderId,VideoAdapter>={kling:reserved('kling','可灵'),jimeng:reserved('jimeng','即梦'),sora:reserved('sora','Sora'),custom:reserved('custom','其他服务')};
export function getProvider(id:unknown) {return typeof id==='string'&&Object.hasOwn(providers,id)?providers[id as ProviderId]:null;}
export async function submitVideo(input:VideoRequest){const provider=getProvider(input.provider);if(!provider)throw new Error('未知视频供应商');return provider.submit(input);}
