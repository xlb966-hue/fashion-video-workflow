import { getProvider,NotConfiguredError } from '@/lib/providers';
import { isWorkflow,totalDuration } from '@/lib/workflow';
export async function POST(request:Request){
 const raw=await request.text();if(raw.length>256_000)return Response.json({error:'请求过大'}, {status:413});
 let input;try{input=JSON.parse(raw);}catch{return Response.json({error:'无效 JSON'}, {status:400});}
 const provider=getProvider(input?.provider);if(!provider)return Response.json({error:'未知视频服务'}, {status:400});
 if(!isWorkflow(input?.workflow)||totalDuration(input.workflow.shots)!==15)return Response.json({error:'请提供完整的 15 秒五分镜工作流'}, {status:400});
 try{return Response.json(await provider.submit(input),{status:202});}catch(error){if(error instanceof NotConfiguredError)return Response.json({code:error.code,error:error.message,actualVideoGenerated:false},{status:501});return Response.json({error:'视频服务请求失败'},{status:502});}
}
