import { ReactNode } from "react";
import { Navigation } from "./Navigation";
import { LayoutProps } from "@/types";

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="md:ml-64 pt-16 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};