import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { getPrisma } from "@/lib/prisma";
export const runtime="nodejs";
const deny=()=>NextResponse.json({error:"Admin access required."},{status:403});
export async function GET(){
  if(!(await getAdminUser())) return deny();
  const categories=await getPrisma().category.findMany({
    orderBy:{name:"asc"},
    include:{parent:{select:{id:true,name:true,slug:true}},children:{select:{id:true,name:true,slug:true,parentId:true},orderBy:{name:"asc"}},_count:{select:{products:true}}}
  });
  return NextResponse.json({categories});
}
function slugify(v:string){return v.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
async function validateParent(parentId:string|null,id?:string){
  if(!parentId) return null;
  if(id&&parentId===id) throw new Error("A category cannot be its own parent.");
  const parent=await getPrisma().category.findUnique({where:{id:parentId},select:{id:true,parentId:true}});
  if(!parent) throw new Error("Selected parent category was not found.");
  if(parent.parentId) throw new Error("Only one subcategory level is supported. Select a top-level category.");
  return parent.id;
}
export async function POST(req:NextRequest){
  if(!(await getAdminUser())) return deny();
  try{
    const b=await req.json(),name=String(b.name||"").trim(),slug=slugify(String(b.slug||name));
    if(!name) return NextResponse.json({error:"Category name is required."},{status:400});
    const parentId=await validateParent(b.parentId?String(b.parentId):null);
    const category=await getPrisma().category.create({data:{name,slug,imageUrl:b.imageUrl?String(b.imageUrl):null,parentId}});
    return NextResponse.json({category},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to create category."},{status:400});}
}
export async function PATCH(req:NextRequest){
  if(!(await getAdminUser())) return deny();
  try{
    const b=await req.json(); if(!b.id)return NextResponse.json({error:"Category id is required."},{status:400});
    const id=String(b.id),parentId=b.parentId!==undefined?(b.parentId?String(b.parentId):null):undefined;
    if(parentId!==undefined) await validateParent(parentId,id);
    const data:any={};
    if(b.name!==undefined)data.name=String(b.name).trim();
    if(b.slug!==undefined)data.slug=slugify(String(b.slug));
    if(b.imageUrl!==undefined)data.imageUrl=b.imageUrl?String(b.imageUrl):null;
    if(parentId!==undefined)data.parentId=parentId;
    const category=await getPrisma().category.update({where:{id},data,include:{parent:{select:{id:true,name:true,slug:true}},children:true,_count:{select:{products:true}}}});
    return NextResponse.json({category});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to update category."},{status:400});}
}
export async function DELETE(req:NextRequest){
  if(!(await getAdminUser())) return deny();
  try{
    const id=req.nextUrl.searchParams.get("id"); if(!id)return NextResponse.json({error:"Category id is required."},{status:400});
    const count=await getPrisma().product.count({where:{categoryId:id}});
    const children=await getPrisma().category.count({where:{parentId:id}});
    if(count)return NextResponse.json({error:"Move or remove this category's products before deleting it."},{status:409});
    if(children)return NextResponse.json({error:"Move or remove this category's subcategories before deleting it."},{status:409});
    await getPrisma().category.delete({where:{id}});
    return NextResponse.json({deleted:true});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Unable to delete category."},{status:400});}
}