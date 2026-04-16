import prisma from "@/lib/prisma";

export async function GET() {
  const users = await prisma.doctor.findMany();
  return Response.json(users);
}

export async function POST() {
  const user = await prisma.doctor.create({
    data: {
      age: 30,
      email: "test@test.com",
      password: "1234",
      name: "TestName",
      phoneNumber: "0777777777",
      role: false,
    },
  });

  return Response.json(user);
}

export async function DELETE() {
  await prisma.doctor.delete({
    where: {
      email: "test@test.com",
    },
  });
}
