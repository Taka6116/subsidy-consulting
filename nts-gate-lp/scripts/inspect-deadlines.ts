import { prisma } from "@/lib/db/prisma";

async function main() {
  const rows = await prisma.subsidyGrant.findMany({
    select: { id: true, name: true, deadline: true, deadlineLabel: true, status: true },
    orderBy: { deadline: "asc" },
    take: 300,
  });

  const now = new Date();
  const future2100 = new Date("2100-01-01");

  const weird = rows.filter((r) => r.deadline && r.deadline > future2100);
  const nullBoth = rows.filter((r) => !r.deadline && !r.deadlineLabel);
  const past = rows.filter(
    (r) => r.deadline && r.deadline < now && r.status === "open",
  );

  console.log("total:", rows.length);
  console.log("deadline > 2100 (おかしい):", weird.length);
  weird.slice(0, 8).forEach((r) =>
    console.log(
      " ",
      r.deadline?.toISOString().slice(0, 10),
      "|",
      r.deadlineLabel,
      "|",
      r.name?.slice(0, 40),
    ),
  );
  console.log("deadline null & label null:", nullBoth.length);
  console.log("past deadline but status=open:", past.length);
  past.slice(0, 5).forEach((r) =>
    console.log(
      " ",
      r.deadline?.toISOString().slice(0, 10),
      "|",
      r.name?.slice(0, 40),
    ),
  );
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
