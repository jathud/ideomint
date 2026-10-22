const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const ts=require('typescript');
function load(result){
 let statuses;const query={select(){return this},in(column,values){statuses=values;return this},order:async()=>result};
 const exports={};
 const source=ts.transpileModule(fs.readFileSync('src/app/ideofest/events/page.tsx','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 vm.runInNewContext(source,{exports,console:{error(){}},require(name){if(name==='react/jsx-runtime')return {jsx:(_type,props)=>props};if(name.includes('supabase/server'))return {createAdminClient:()=>({from:()=>query})};if(name==='./EventsCatalog')return {default:()=>null};throw Error(name)}});
 return {page:exports,statuses:()=>statuses};
}
test('filtered catalog URLs are noindex while main listing is indexable',async()=>{
 const {page}=load({data:[],error:null});
 assert.equal((await page.generateMetadata({searchParams:Promise.resolve({category:'tech'})})).robots.index,false);
 assert.equal((await page.generateMetadata({searchParams:Promise.resolve({})})).robots.index,true);
});
test('server provides published records and the URL category before hydration',async()=>{
 const records=[{slug:'sample',category:'music'}];const loaded=load({data:records,error:null});
 const props=await loaded.page.default({searchParams:Promise.resolve({category:'tech'})});
 assert.equal(props.events,records);assert.equal(props.initialCategory,'tech');assert.equal(props.unavailable,false);
 assert.deepEqual(Array.from(loaded.statuses()),['published','sold_out']);
});
test('database failures remain distinct from a valid empty catalog',async()=>{
 const {page}=load({data:null,error:new Error('offline')});
 const props=await page.default({searchParams:Promise.resolve({})});assert.equal(props.unavailable,true);assert.equal(props.events.length,0);
});
