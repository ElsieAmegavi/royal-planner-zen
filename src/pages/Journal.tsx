import { Layout } from "@/components/Layout";
import { WeekView } from "@/components/WeekView";

const Journal = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Academic Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your weekly schedule and upcoming deadlines
            </p>
          </div>
          <WeekView />
        </div>
      </div>
    </Layout>
  );
};

export default Journal;