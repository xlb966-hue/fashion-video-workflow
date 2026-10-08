import { getProvider, NotConfiguredError } from '@/lib/providers';
export async function GET(_request:Request,{params}:{params:Promise<{provider:string;taskId:string}>}){
 const {provider:id,taskId}=await params;const provider=getProvider(id);if(!provider)return Response.json({error:'未知视频服务'},{status:400});
 try{return Response.json(await provider.getTask(taskId));}catch(error){if(error instanceof NotConfiguredError)return Response.json({code:error.code,error:error.message,actualVideoGenerated:false},{status:501});return Response.json({error:'查询失败'},{status:502});}
}
