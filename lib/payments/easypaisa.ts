import { createCipheriv, createHash, randomBytes } from "node:crypto";

export type EasypaisaFields = Record<string,string>;

export function easypaisaNonce(bytes=18){
  return randomBytes(bytes).toString("hex");
}

export function easypaisaExpiry(minutes=30,date=new Date()){
  const d=new Date(date.getTime()+minutes*60*1000);
  const parts=new Intl.DateTimeFormat("en-GB",{timeZone:"Asia/Karachi",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(d);
  const get=(type:string)=>parts.find(p=>p.type===type)?.value||"";
  return `${get("year")}${get("month")}${get("day")} ${get("hour")}${get("minute")}${get("second")}`;
}

function aesKey(key:string){
  const raw=Buffer.from(key,"utf8");
  if([16,24,32].includes(raw.length))return raw;
  return createHash("sha256").update(raw).digest().subarray(0,16);
}

export function createEasypaisaMerchantHash(fields:EasypaisaFields,hashKey:string){
  const normalized=Object.entries(fields)
    .filter(([k,v])=>k!=="merchantHashedReq" && v!=="" && v!=null)
    .sort(([a],[b])=>a.localeCompare(b))
    .map(([k,v])=>`${k}=${String(v).replace(/\s/g,"")}`)
    .join("&");
  const cipher=createCipheriv("aes-128-ecb",aesKey(hashKey),null);
  cipher.setAutoPadding(true);
  return Buffer.concat([cipher.update(normalized,"utf8"),cipher.final()]).toString("base64");
}

export function hashEasypaisaFields(fields:EasypaisaFields){
  return createHash("sha256").update(JSON.stringify(fields),"utf8").digest("hex");
}
