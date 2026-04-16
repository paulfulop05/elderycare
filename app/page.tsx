import Landing from "@/screens/Landing";

export default function Home() {
  return <Landing />;
}

// import prisma from "@/lib/prisma";
// export default async function Home() {
//   const doctors = await prisma.doctor.findMany();
//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center -mt-16">
//       <h1 className="text-4xl font-bold mb-8 font-[family-name:var(--font-geist-sans)] text-[#333333]">
//         Doctors
//       </h1>
//       <ol className="list-decimal list-inside font-[family-name:var(--font-geist-sans)]">
//         {doctors.map((doctor) => (
//           <li
//             key={doctor.did}
//             className="mb-2 fgont-medium text-lg text-[#555555]"
//           >
//             {doctor.name}
//           </li>
//         ))}
//       </ol>
//     </div>
//   );
// }
