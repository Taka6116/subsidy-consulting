const { PrismaClient } = require('./.prisma/client') 

// fallback
let prisma
try {
  prisma = new PrismaClient()
} catch(e) {
  const p2 = require('./node_modules/@prisma/client')
  prisma = new p2.PrismaClient()
}

async function main() {
  const grants = await prisma.subsidyGrant.findMany({
    where: { status: 'open' },
    select: { id: true, name: true, targetIndustries: true, maxAmountLabel: true, deadlineLabel: true, institutionName: true },
    orderBy: { syncedAt: 'desc' },
    take: 200,
  })
  for (const g of grants) {
    const row = [g.id, (g.name||'').slice(0,60), JSON.stringify(g.targetIndustries||[]).slice(0,50), g.maxAmountLabel||'', g.deadlineLabel||''].join(' | ')
    console.log(row)
  }
  await prisma.$disconnect()
}
main().catch(e => { console.error(e.message); process.exit(1) })
