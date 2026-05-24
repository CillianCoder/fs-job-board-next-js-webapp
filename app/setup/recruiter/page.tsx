import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import RecruiterSetupClient from "./RecruiterSetupClient";

export const metadata = {
  title: "Recruiter Profile Setup | Devforge",
  description: "Complete your employer details to post and manage job opportunities.",
};

export default async function RecruiterSetupPage() {
  const session = await getSession();
  if (!session || session.role !== "EMPLOYER") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { employer: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <RecruiterSetupClient 
      initialCompanyName={user.employer?.name || ""} 
      initialWebsite={user.employer?.website || ""}
      initialLogoUrl={user.employer?.logoUrl || ""}
      initialDescription={user.employer?.description || ""}
    />
  );
}
