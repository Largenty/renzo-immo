"use client";

import { useParams } from "next/navigation";
import { EditProjectForm } from "@/modules/projects";

export default function EditProjectPage() {
  const params = useParams();
  const projectId = typeof params.id === "string" ? params.id : "";

  return (
    <div className="max-w-3xl mx-auto py-8">
      <EditProjectForm projectId={projectId} />
    </div>
  );
}
