import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { jobs } from '../data/jobs'
import { generateJobSlug } from '../utils/slugify'
import bcrypt from 'bcryptjs'

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })

  console.log('Starting relational seeding...')

  // Hash standard password for seed accounts
  const defaultPasswordHash = await bcrypt.hash('password123', 10)

  // 1a. Create Admin User
  const adminPasswordHash = await bcrypt.hash('123Devforge', 10)
  await prisma.user.upsert({
    where: { email: 'info@devforge.com' },
    update: {
      password: adminPasswordHash,
    },
    create: {
      email: 'info@devforge.com',
      name: 'System Admin',
      role: 'ADMIN',
      password: adminPasswordHash,
    }
  })
  console.log('Created system admin account (info@devforge.com).')

  // 1b. Create Categories
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
      update: {
        password: defaultPasswordHash,
      },
      create: {
        email,
        name: `${company} HR`,
        role: "EMPLOYER",
        password: defaultPasswordHash,
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

  // 2b. Create Candidates
  const candidatesData = [
    { email: 'candidate1@devforge.com', name: 'Alice Smith', phone: '123-456-7890', github: 'github.com/alice', linkedin: 'linkedin.com/in/alice', experience: '3 years of React development', coverLetter: 'I love building UI!' },
    { email: 'candidate2@devforge.com', name: 'Bob Jones', phone: '098-765-4321', github: 'github.com/bob', linkedin: 'linkedin.com/in/bob', experience: '5 years of Python backend development', coverLetter: 'I am a backend specialist.' }
  ]
  for (const cand of candidatesData) {
    const user = await prisma.user.upsert({
      where: { email: cand.email },
      update: {
        password: defaultPasswordHash,
      },
      create: {
        email: cand.email,
        name: cand.name,
        role: 'CANDIDATE',
        password: defaultPasswordHash,
      }
    })
    await prisma.candidateProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: cand.name,
        phone: cand.phone,
        github: cand.github,
        linkedin: cand.linkedin,
        experience: cand.experience,
        coverLetter: cand.coverLetter
      }
    })
  }
  console.log(`Created ${candidatesData.length} candidates.`)

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
