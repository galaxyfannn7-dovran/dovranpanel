import {inflateRawSync} from "node:zlib";
export default async req=>{
  const tok=new URL(req.url).pathname.split("/").pop().replace(/\.txt$/,"");
  let o;
  try{
    const b=Buffer.from(tok.slice(1),"base64");
    o=JSON.parse((tok[0]==="z"?inflateRawSync(b):b).toString("utf8"));
  }catch(e){return new Response("bad link",{status:400})}
  if(!o||!Array.isArray(o.s)||Date.now()>o.e)return new Response("expired",{status:403});
  const L=o.s.filter(s=>/^[a-z0-9]+:\/\//i.test(s));
  const body="#profile-title: "+String(o.n).slice(0,40)+"\n"+L.join("\n");
  return new Response(body,{headers:{
    "content-type":"text/plain; charset=utf-8",
    "subscription-userinfo":"upload=0; download=0; total=0; expire="+Math.floor(o.e/1000),
    "profile-update-interval":"12"}});
};
export const config={path:"/sub/*"};
