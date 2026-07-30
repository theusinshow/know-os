import { getDatabaseUrl } from "@/db/connection";
import { MemoryProjectRepository } from "@/db/repositories/memory-store";
import { ProjectRepository } from "@/db/repositories/project-repository";
import { getServerEnv } from "@/lib/env";

type ProjectStore = Pick<ProjectRepository, "createProject" | "listProjects">;

export async function listProjects(repository: ProjectStore = createProjectRepository()) {
  return repository.listProjects(getServerEnv().KNOW_OS_OWNER_ID);
}

export async function createProjectContext(
  input: Readonly<{
    stableId: string;
    title: string;
    description?: string | null;
    conceptStableIds?: readonly string[];
    activityStableIds?: readonly string[];
  }>,
  repository: ProjectStore = createProjectRepository()
) {
  return repository.createProject({
    ownerId: getServerEnv().KNOW_OS_OWNER_ID,
    ...input
  });
}

function createProjectRepository(): ProjectStore {
  if (getDatabaseUrl() === "memory://local") {
    return new MemoryProjectRepository();
  }

  return new ProjectRepository();
}
