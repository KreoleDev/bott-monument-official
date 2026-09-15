import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
const source=ts.transpileModule(fs.readFileSync(new URL('../src/lib/comments.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;

test('loads all published comment pages beyond the first hundred in order',async()=>{
  const requests=[];
  const context={exports:{},process:{env:{STRAPI_URL:'http://cms',STRAPI_API_TOKEN:'test',NODE_ENV:'development'}},console,fetch:async(url,options)=>{
    const request=JSON.parse(options.body); requests.push(request);
    assert.match(request.query,/status: PUBLISHED/);
    const page=request.variables.page;
    return {ok:true,json:async()=>({data:{comments_connection:{nodes:Array.from({length:page===3?5:100},(_,i)=>({documentId:String((page-1)*100+i)})),pageInfo:{pageCount:3}}}})};
  }};
  vm.runInNewContext(source,context);
  const comments=await context.exports.getComments();
  assert.equal(comments.length,205);
  assert.equal(comments[204].documentId,'204');
  assert.deepEqual(requests.map(r=>r.variables.page),[1,2,3]);
});

test('returns an empty list for an empty published collection',async()=>{
  let calls=0;
  const context={exports:{},process:{env:{STRAPI_URL:'http://cms',STRAPI_API_TOKEN:'test'}},console,fetch:async()=>{calls++;return{ok:true,json:async()=>({data:{comments_connection:{nodes:[],pageInfo:{pageCount:0}}}})}}};
  vm.runInNewContext(source,context);
  assert.equal((await context.exports.getComments()).length,0);
  assert.equal(calls,1);
});
