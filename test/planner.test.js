import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validate,template,validPlan} from '../src/services/planner.js';
const input={clothing:'data:image/png;base64,YQ==',face:'data:image/jpeg;base64,YQ==',style:'自然清新',scene:'自然花园',brief:'轻盈质感',ratio:'9:16',duration:30};
test('生成五个连续分镜并应用创作参数',()=>{validate(input);const plan=template(input);assert.ok(validPlan(plan));assert.equal(plan.shots[0].time,'0–6 秒');assert.equal(plan.shots[4].time,'24–30 秒');assert.match(plan.shots[0].prompt,/自然花园/);assert.match(plan.shots[0].prompt,/轻盈质感/);});
test('拒绝缺失图片、不支持的格式及无效参数',()=>{for(const edit of [{face:''},{clothing:'data:image/svg+xml;base64,YQ=='},{duration:0},{ratio:'2:1'},{brief:42}])assert.throws(()=>validate({...input,...edit}));});
test('拒绝缺失或多余分镜的模型结果',()=>{const plan=template(input);plan.shots.pop();assert.equal(validPlan(plan),false);assert.equal(validPlan({}),false);});
