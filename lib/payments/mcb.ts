export async function mcbCreateSession(base:string,version:string,merchantId:string,password:string,payload:unknown){const auth=Buffer.from("merchant."+merchantId+":"+password).toString("base64");const r=await fetch(base.replace(/\/$/,"")+"/api/rest/version/"+encodeURIComponent(version)+"/merchant/"+encodeURIComponent(merchantId)+"/session",{method:"POST",headers:{Authorization:"Basic "+auth,"Content-Type":"application/json"},body:JSON.stringify(payload),cache:"no-store"});const j=await r.json();if(!r.ok||!j.session?.id)throw new Error(j.error?.explanation||j.error?.message||"MCB eGate session creation failed.");return j}
export async function mcbGetOrder(base:string,version:string,merchantId:string,password:string,orderId:string){
  const auth=Buffer.from("merchant."+merchantId+":"+password).toString("base64");
  const url=base.replace(/\/$/,"")+"/api/rest/version/"+encodeURIComponent(version)+"/merchant/"+encodeURIComponent(merchantId)+"/order/"+encodeURIComponent(orderId);
  const r=await fetch(url,{headers:{Authorization:"Basic "+auth,Accept:"application/json"},cache:"no-store"});
  const j=await r.json();
  if(!r.ok) throw new Error(j.error?.explanation||j.error?.message||"MCB order status request failed.");
  return j;
}
