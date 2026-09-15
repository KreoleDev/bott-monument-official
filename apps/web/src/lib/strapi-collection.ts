import { cmsRead, cmsQuery } from './cms-cache';
export async function getCollection<T>(connection: string, fields: string, sort: string[], preview=false): Promise<T[]> {
 return cmsRead(`collection:${connection}`,async()=>{
  const items:T[]=[];
  let page=1,pageCount=1;
  do {
   const data=await cmsQuery<Record<string,{nodes:T[];pageInfo:{pageCount:number}}>>(`query Collection($page:Int!) {
    ${connection}(status:${preview?'DRAFT':'PUBLISHED'},sort:${JSON.stringify(sort)},pagination:{page:$page,pageSize:100}) {
     nodes { ${fields} } pageInfo { pageCount }
    }
   }`,{page},preview);
   const value=data[connection];
   if(!value || !Array.isArray(value.nodes)) throw new Error('Invalid collection');
   items.push(...value.nodes);pageCount=value.pageInfo.pageCount;page++;
  } while(page<=pageCount);
  return items;
 },[],preview);
}
