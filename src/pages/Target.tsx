import { Layout } from "@/components/Layout";

const Target = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary-light/10 to-accent-light/20 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Target Grade Estimator</h1>
            <p className="text-muted-foreground">
              Set your academic goals and see what grades you need to achieve them
            </p>
          </div>
          <div className="text-center py-12 text-muted-foreground">
            <p>Target Grade Estimator coming soon!</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Target;