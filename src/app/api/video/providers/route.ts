import { providers } from '@/lib/providers';
export async function GET(){return Response.json({providers:Object.values(providers).map(({id,name,configured})=>({id,name,configured})),actualVideoGenerated:false});}
