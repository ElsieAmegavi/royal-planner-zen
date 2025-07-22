import { Layout } from "@/components/Layout";

const Journal = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Reflection Journal</h1>
            <p className="text-muted-foreground">
              Track your academic journey, wins, and areas for growth
            </p>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <p>Reflection Journal coming soon!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Journal;