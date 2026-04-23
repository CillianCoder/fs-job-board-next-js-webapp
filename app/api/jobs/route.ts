import { NextResponse } from "next/server";
import { getJobs } from "@/lib/jobs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const query = searchParams.get("q") || undefined;
  const location = searchParams.get("location") || undefined;
  const type = searchParams.get("type") || undefined;
  
  const pageParam = searchParams.get("page");
  const page = pageParam ? parseInt(pageParam, 10) : undefined;
  
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;

  try {
    const result = await getJobs({ query, location, type, page, limit });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 });
  }
}
