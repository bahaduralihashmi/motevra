import { auth } from "@/auth";
import { getPrisma } from "@/lib/prisma";
export async function getAdminUser(){const s=await auth();const email=s?.user?.email?.trim().toLowerCase();if(!email)return null;const configured=(process.env.ADMIN_EMAILS??"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);const u=await getPrisma().user.findUnique({where:{email},select:{id:true,role:true,name:true,email:true}});if(configured.includes(email))return{id:u?.id??null,role:"ADMIN" as const,name:u?.name??null,email};if(!u||!["ADMIN","STAFF"].includes(u.role))return null;return u}
