import fs from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve('aphis-data');
const slug=s=>String(s).normalize('NFKD').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);
const safe=s=>{const v=slug(s);if(!v)throw Error('Name required');return v};
export default function archive(){return {name:'aphis-archive',configureServer(server){server.middlewares.use('/api/aphis',async(req,res)=>{res.setHeader('Content-Type','application/json');try{
const index=path.join(root,'index.json');let data;try{data=JSON.parse(await fs.readFile(index,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e;data={library:[],projects:[{name:'VINILE',collections:['LIVE','DISCO','RED PASSION','BURRO'].map(name=>({name,clips:[]}))}]}}
if(req.method==='GET'){res.end(JSON.stringify(data));return}
if(req.method!=='POST')throw Error('Unsupported method');
let body='';for await(const chunk of req){body+=chunk;if(body.length>2000000)throw Error('Request too large')}const a=JSON.parse(body);
const project=a.project?data.projects.find(p=>p.name===a.project):null;if(a.project&&!project)throw Error('Unknown project');
const collections=project?project.collections:data.library;
if(a.action==='project'){safe(a.name);if(data.projects.some(p=>slug(p.name)===slug(a.name)))throw Error('Project exists');data.projects.push({name:a.name,collections:[]});await fs.mkdir(path.join(root,'projects',safe(a.name)),{recursive:true})}
else if(a.action==='collection'){safe(a.name);if(collections.some(p=>slug(p.name)===slug(a.name)))throw Error('Collection exists');collections.push({name:a.name,clips:[]});await fs.mkdir(path.join(root,project?'projects':'library',...(project?[safe(project.name)]:[]),safe(a.name)),{recursive:true})}
else if(a.action==='clip'){const col=collections.find(c=>c.name===a.collection);if(!col)throw Error('Unknown collection');const id=safe(a.name);const clip={...a.patch,name:a.name,id};const dir=path.join(root,project?'projects':'library',...(project?[safe(project.name)]:[]),safe(col.name));await fs.mkdir(dir,{recursive:true});await fs.writeFile(path.join(dir,id+'.json'),JSON.stringify(clip,null,2));col.clips=col.clips.filter(c=>c.id!==id);col.clips.push(clip)}
else throw Error('Unknown action');
await fs.mkdir(root,{recursive:true});await fs.writeFile(index,JSON.stringify(data,null,2));res.end(JSON.stringify(data));
}catch(e){res.statusCode=400;res.end(JSON.stringify({error:e.message}))}})}}}
