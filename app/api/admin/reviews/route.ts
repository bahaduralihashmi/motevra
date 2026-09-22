import { NextRequest,NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
export const runtime="nodejs";
export async function GET(){if(!await getAdminUser())return NextResponse.json({error:"Admin access required."},{status:403});return NextResponse.json({reviews:await getPrisma().review.findMany({orderBy:{createdAt:"desc"},take:200,include:{product:{select:{name:true,slug:true}},user:{select:{name:true,email:true}},order:{select:{number:true}}})})}
export async function PATCH(req:NextRequest){if(!await getAdminUser())return NextResponse.json({error:"Admin access required."},{status:403});const b=await req.json(),id=String(b.id||""),status=String(b.status||"");if(!id||!["PENDING","APPROVED","REJECTED"].includes(status))return NextResponse.json({error:"Valid review id and status are required."},{status:400});return NextResponse.json({review:await getPrisma().review.update({where:{id},data:{status:status as any}})})}
