"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { BarChart, Users, FileText, TrendingUp, AlertCircle, LogOut } from "lucide-react";
import { getDataSummary } from "@/lib/mock-data-generator";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export const dynamic = "force-dynamic";

interface AuthUser {
  email: string;
  id: string;
  createdAt: string;
}

export default function HomePage() {
  const router = useRouter();
  const [stats, setStats] = useState<any[]>([]);
  const [dataSummary, setDataSummary] = useState<any>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem("auth_user");
        if (!storedUser) {
          router.push("/login");
          return;
        }
        const user = JSON.parse(storedUser) as AuthUser;
        setAuthUser(user);
      } catch (error) {
        console.error("Error checking auth:", error);
        router.push("/login");
      }
    };
    checkAuth();
  }, [router]);

  useEffect(() => {
    if (authUser) {
      const summary = getDataSummary();
      setDataSummary(summary);
      const statsList = [
        { icon: FileText, label: "Documents", value: summary.documents.toString(), trend: "+0 today" },
        { icon: BarChart, label: "Insights", value: summary.insights.toString(), trend: summary.insights > 0 ? `+${summary.insights} identified` : "0 yet" },
        { icon: Users, label: "Personas", value: summary.personas.toString(), trend: summary.personas > 0 ? "Generated" : "None yet" },
        { icon: TrendingUp, label: "Opportunities", value: summary.opportunities.toString(), trend: summary.opportunities > 0 ? `+${summary.opportunities} found` : "0 yet" },
      ];
      setStats(statsList);
      setIsLoading(false);
    }
  }, [authUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      localStorage.removeItem("auth_user");
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
      router.push("/login");
    }
  };

  if (isLoading || !authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 mb-4 animate-pulse">
            <div className="w-6 h-6 bg-white rounded-full"></div>
          </div>
          <p className="text-lg font-semibold">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dataSummary) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
          <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Welcome, {authUser.email.split("@")[0]}!
                </h1>
                <p className="text-slate-400 mt-1">Here's your research overview and recent activity.</p>
              </div>
              <Button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm hover:border-indigo-500/50 transition">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-indigo-400 mt-2">{stat.trend}</p>
                      </div>
                      <Icon className="w-6 h-6 text-indigo-600 opacity-50" />
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4">Data Overview</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span className="text-white text-sm">Documents Uploaded</span>
                    </div>
                    <span className="text-white font-semibold">{dataSummary.documents}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <BarChart className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">Insights Extracted</span>
                    </div>
                    <span className="text-white font-semibold">{dataSummary.insights}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-purple-400" />
                      <span className="text-white text-sm">Personas Generated</span>
                    </div>
                    <span className="text-white font-semibold">{dataSummary.personas}</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-white text-sm">Opportunities Found</span>
                    </div>
                    <span className="text-white font-semibold">{dataSummary.opportunities}</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
                <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Data Ready</p>
                      <span className="text-xs font-semibold text-emerald-400">{dataSummary.totalDataPoints > 0 ? "Active" : "Waiting"}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (dataSummary.totalDataPoints / 50) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{Math.min(100, (dataSummary.totalDataPoints / 50) * 100).toFixed(0)}%</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-slate-400 text-sm">Analysis Complete</p>
                      <span className="text-xs font-semibold text-blue-400">{dataSummary.personas > 0 ? "Done" : "Pending"}</span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-600 to-blue-600 h-2 rounded-full"
                        style={{ width: dataSummary.personas > 0 ? "100%" : "0%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{dataSummary.personas > 0 ? "100" : "0"}%</p>
                  </div>
                </div>
              </Card>
            </div>

            {dataSummary.documents === 0 && (
              <Card className="p-6 bg-indigo-500/10 border-indigo-500/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="text-white font-semibold">Get Started</p>
                    <p className="text-slate-300 text-sm">Upload your first document to start analyzing customer research and generating insights.</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-4 bg-slate-800/30 border-slate-700/30 backdrop-blur-sm">
              <p className="text-xs text-slate-500">
                Logged in as: <span className="text-slate-300 font-semibold">{authUser.email}</span>
              </p>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
