export async function GET() { return Response.json({configured:false,status:'pending',message:'尚未接入视觉模型，支持手动编辑，未执行图片识别'}); }
export async function POST() { return Response.json({code:'VISION_NOT_CONFIGURED',status:'pending',message:'尚未接入视觉模型，请手动填写分析字段'}, {status:501}); }
