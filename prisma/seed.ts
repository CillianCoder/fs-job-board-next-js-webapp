import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { jobs } from '../data/jobs'
import { generateJobSlug } from '../utils/slugify'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Starting relational seeding...')

  // 1. Create Categories
  const categoryNames = [
    "Engineering",
    "Mobile",
    "Data & AI",
    "DevOps & Cloud",
    "Design & Product",
    "QA & Testing",
    "Security"
  ]
  
  const categoryMap = new Map<string, string>()
  
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, description: `Jobs related to ${name}` }
    })
    categoryMap.set(name, cat.id)
  }
  console.log(`Created ${categoryMap.size} categories.`)

  // 2. Create Users and Employers
  const uniqueCompanies = Array.from(new Set(jobs.map(j => j.company)))
  const employerMap = new Map<string, string>()

  for (const company of uniqueCompanies) {
    const emailSlug = company.toLowerCase().replace(/[^a-z0-9]+/g, '')
    const email = `hr@${emailSlug}.com`
    
    // Create User (Employer role)
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: `${company} HR`,
        role: "EMPLOYER"
      }
    })

    // Create Employer
    const employer = await prisma.employer.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        name: company,
        userId: user.id,
        description: `Profile for ${company}`
      }
    })
    
    employerMap.set(company, employer.id)
  }
  console.log(`Created ${employerMap.size} employers and users.`)

  // 3. Create Jobs
  let count = 0;
  for (const job of jobs) {
    const slug = generateJobSlug(job)
    const employerId = employerMap.get(job.company)
    
    // Simple category matching logic
    let categoryName = "Engineering"
    const titleLow = job.title.toLowerCase()
    
    if (titleLow.includes('ios') || titleLow.includes('android') || titleLow.includes('mobile')) {
      categoryName = "Mobile"
    } else if (titleLow.includes('data') || titleLow.includes('machine learning') || titleLow.includes('ai')) {
      categoryName = "Data & AI"
    } else if (titleLow.includes('devops') || titleLow.includes('cloud') || titleLow.includes('reliability')) {
      categoryName = "DevOps & Cloud"
    } else if (titleLow.includes('product') || titleLow.includes('design')) {
      categoryName = "Design & Product"
    } else if (titleLow.includes('qa') || titleLow.includes('test')) {
      categoryName = "QA & Testing"
    } else if (titleLow.includes('security')) {
      categoryName = "Security"
    }
    
    const categoryId = categoryMap.get(categoryName)

    await prisma.job.upsert({
      where: { slug },
      update: {}, // Don't update if exists
      create: {
        title: job.title,
        company: job.company, // keeping for backward compatibility in the schema
        location: job.location,
        salary: job.salary,
        type: job.type,
        tags: job.tags,
        postedAt: new Date(job.postedAt),
        slug: slug,
        employerId,
        categoryId
      }
    })
    count++;
  }

  console.log(`Seeded ${count} jobs successfully.`)
  
  await prisma.$disconnect()
  await pool.end()
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
