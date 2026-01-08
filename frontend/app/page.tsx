import NavigationList from "@/components/NavigationList";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="container mx-auto py-10">
        <NavigationList />
      </main>
    </div>
  );
}
