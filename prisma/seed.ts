import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not configured.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const tyreCategory = await prisma.category.upsert({ where:{slug:"tyres"}, update:{}, create:{name:"Tyres",slug:"tyres"} });
  const brand = await prisma.brand.upsert({ where:{slug:"motevra"}, update:{}, create:{name:"MOTEVRA",slug:"motevra"} });
  const size = await prisma.tyreSize.upsert({ where:{label:"205/55 R16"}, update:{}, create:{width:205,aspectRatio:55,rimSize:16,label:"205/55 R16"} });
  await prisma.product.upsert({
    where:{slug:"motevra-touring-pro-205-55-r16"}, update:{},
    create:{sku:"MOT-TOUR-2055516",slug:"motevra-touring-pro-205-55-r16",name:"MOTEVRA Touring Pro",description:"Demo catalogue tyre for development and testing.",productType:"TYRE",price:"89.00",currency:"USD",status:"ACTIVE",stock:24,brandId:brand.id,categoryId:tyreCategory.id,tyre:{create:{tyreSizeId:size.id,loadIndex:91,speedRating:"V",season:"ALL_SEASON"}}}
  });
  const toyota=await prisma.vehicleMake.upsert({where:{slug:"toyota"},update:{},create:{name:"Toyota",slug:"toyota"}});
  const corolla=await prisma.vehicleModel.upsert({where:{makeId_slug:{makeId:toyota.id,slug:"corolla"}},update:{},create:{name:"Corolla",slug:"corolla",makeId:toyota.id}});
  const variant=await prisma.vehicleVariant.upsert({where:{modelId_slug:{modelId:corolla.id,slug:"1-6-2020"}},update:{},create:{name:"1.6",slug:"1-6-2020",modelId:corolla.id,yearFrom:2020,yearTo:2024,engine:"1.6L",bodyType:"SEDAN"}});
  await prisma.vehicleFitment.upsert({where:{vehicleVariantId_tyreSizeId_position:{vehicleVariantId:variant.id,tyreSizeId:size.id,position:"front"}},update:{},create:{vehicleVariantId:variant.id,tyreSizeId:size.id,position:"front"}});
  await prisma.vehicleFitment.upsert({where:{vehicleVariantId_tyreSizeId_position:{vehicleVariantId:variant.id,tyreSizeId:size.id,position:"rear"}},update:{},create:{vehicleVariantId:variant.id,tyreSizeId:size.id,position:"rear"}});
  console.log("MOTEVRA Phase C seed complete.");
}
main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
