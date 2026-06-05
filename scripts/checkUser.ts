import prisma from "../lib/prisma";

(async () => {
  try {
    const u = await prisma.user.findUnique({
      where: { email: "info@devforge.com" },
    });
    console.log(u ? `FOUND: ${u.email}` : "NOT FOUND");
  } catch (err) {
    console.error("Query error:", err);
  } finally {
    await prisma.$disconnect();
  }
})();
