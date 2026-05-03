import prisma from './lib/prisma'

async function main() {
  const job = await prisma.job.create({
    data: {
      title: 'Test Job',
      company: 'Test Company',
      location: 'Remote',
      salary: '$100k',
      type: 'Full-time',
      slug: 'test-job',
    }
  })
  console.log('Created job:', job)
  const jobs = await prisma.job.findMany()
  console.log('All jobs:', jobs)
  await prisma.job.delete({ where: { id: job.id } })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
