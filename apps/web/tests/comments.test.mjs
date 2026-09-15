import {test} from 'node:test';
import assert from 'node:assert/strict';
import {loadTs} from './load-ts.mjs';
const env={STRAPI_URL:'http://cms',STRAPI_API_TOKEN:'test'};
test('loads every published comment beyond the first hundred in order',async()=>{
 const requests=[];
 const api=loadTs('../src/lib/comments.ts',{env,fetch:async(_url,options)=>{
  const request=JSON.parse(options.body);requests.push(request);assert.match(request.query,/status:\s*PUBLISHED/);
  const page=request.variables.page;
  return {ok:true,json:async()=>({data:{comments_connection:{nodes:Array.from({length:page===3?5:100},(_,i)=>({documentId:String((page-1)*100+i)})),pageInfo:{pageCount:3}}}})};
 }});
 const items=await api.getComments();assert.equal(items.length,205);assert.equal(items[204].documentId,'204');assert.deepEqual(requests.map(r=>r.variables.page),[1,2,3]);
});
test('empty published collection stays empty',async()=>{
 const api=loadTs('../src/lib/comments.ts',{env,fetch:async()=>({ok:true,json:async()=>({data:{comments_connection:{nodes:[],pageInfo:{pageCount:0}}}})})});
 assert.equal((await api.getComments()).length,0);
});
