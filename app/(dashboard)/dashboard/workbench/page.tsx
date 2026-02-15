import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getMyPostedJobs, getMyBids } from "@/app/actions/job";
import { WorkbenchClient } from "./WorkbenchClient";

export const metadata: Metadata = {
  title: "我的工作台 | AI-Hub",
};

export default async function WorkbenchPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?redirectedFrom=/dashboard/workbench");
  }

  const [postedJobs, myBids] = await Promise.all([
    getMyPostedJobs(),
    getMyBids(),
  ]);

  return <WorkbenchClient postedJobs={postedJobs} myBids={myBids} />;
}
