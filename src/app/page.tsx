import HomeClient from "@/components/features/home-client";

export const revalidate = 60; // Revalidate every 60 seconds

export default function Home() {
  return <HomeClient />;
}
