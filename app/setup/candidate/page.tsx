import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import CandidateSetupClient from "./CandidateSetupClient";

export const metadata = {
  title: "Candidate Profile Setup | Devforge",
  description: "Complete your candidate profile to apply for software engineering roles.",
};

export default async function CandidateSetupPage() {
  const session = await getSession();
  if (!session || session.role !== "CANDIDATE") {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { candidate: true }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <CandidateSetupClient 
      initialName={user.candidate?.name || user.name || ""} 
      initialPhone={user.candidate?.phone || ""}
      initialLinkedin={user.candidate?.linkedin || ""}
      initialGithub={user.candidate?.github || ""}
      initialExperience={user.candidate?.experience || ""}
      initialCoverLetter={user.candidate?.coverLetter || ""}
      initialResumeUrl={user.candidate?.resumeUrl || ""}
    />
  );
}
