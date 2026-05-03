import prisma from './lib/prisma';

async function test() {
  try {
    const job = await prisma.job.findFirst();
    if (!job) throw new Error("No jobs");
    
    await prisma.application.create({
      data: {
        jobId: job.id,
        name: "Test",
        email: "test@test.com",
        phone: "1234567890",
        linkedin: null,
        github: null,
        experience: "1-3",
        coverLetter: "Test",
        resumeUrl: "/test.pdf"
      }
    });
    console.log("Success");
  } catch (e) {
    console.error(e);
  }
}
test();
