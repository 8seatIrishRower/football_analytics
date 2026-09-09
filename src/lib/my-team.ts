import { prisma } from "@/lib/prisma";

/**
 * The coach's own roster for physical testing (Phase 1) is always the
 * earliest-created Youth-level team. Phase 1 pages (Players/Entry/Results)
 * stay scoped to this team even though Player now belongs to a Team in
 * general (for Phase 2's other tracked teams).
 */
export async function getMyTeam() {
  return prisma.team.findFirst({
    where: { level: "YOUTH" },
    orderBy: { createdAt: "asc" },
  });
}
