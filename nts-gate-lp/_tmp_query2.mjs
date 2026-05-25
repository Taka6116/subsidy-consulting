import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// Check generatedContent linked to construction/known grants
const contents = await prisma.generatedContent.findMany({
  where: { contentType: 'lp', status: 'published' },
  select: { id: true, title: true, grantId: true, body: true },
  orderBy: { publishedAt: 'desc' },
  take: 300,
})

for (const c of contents) {
  const grant = await prisma.subsidyGrant.findUnique({
    where: { id: c.grantId },
    select: { id: true, name: true, maxAmountLabel: true, subsidyAmount: true },
  })
  if (!grant) continue
  const name = (grant.name || '').slice(0, 60)
  // Flag ones with known dedicated LP paths
  const isKnown = ['建設機械', 'デジタル技術', '賃上げ', '設備投資', '物流'].some(k => name.includes(k))
  if (isKnown) {
    console.log(`contentId=${c.id} | grantId=${grant.id} | ${name} | ${grant.maxAmountLabel} | subsidyAmount=${grant.subsidyAmount}`)
  }
}

await prisma.$disconnect()
