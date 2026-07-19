"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { getPersonas } from "@/lib/storage";

export default function PersonasPage() {
  const [personas, setPersonas] = useState<any[]>([]);

  useEffect(() => {
    const stored = getPersonas();
    setPersonas(stored);
  }, []);

  const typeColors: Record<string, string> = {
    primary: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    secondary: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    tertiary: "bg-slate-500/10 text-slate-300 border-slate-500/30",
  };

  const sizeColors: Record<string, string> = {
    large: "bg-green-500/10 text-green-300 border-green-500/30",
    medium: "bg-yellow-500/10 text-yellow-300 border-yellow-500/30",
    small: "bg-orange-500/10 text-orange-300 border-orange-500/30",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Personas</h1>
          <p className="text-slate-400 mt-1">Detailed profiles of your target audiences</p>
        </div>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          New Persona
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Total Personas</p>
          <p className="text-3xl font-bold text-white mt-2">{personas.length}</p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Primary</p>
          <p className="text-3xl font-bold text-indigo-400 mt-2">
            {personas.filter((p) => p.type === "primary").length}
          </p>
        </Card>
        <Card className="p-4 bg-slate-800/50 border-slate-700/50">
          <p className="text-slate-400 text-sm">Secondary</p>
          <p className="text-3xl font-bold text-purple-400 mt-2">
            {personas.filter((p) => p.type === "secondary").length}
          </p>
        </Card>
      </div>

      {/* Personas Grid */}
      <div className="space-y-6">
        {personas.length > 0 ? (
          personas.map((persona) => (
            <Card
              key={persona.id}
              className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50 transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{persona.name}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs border ${typeColors[persona.type] || ""}`}
                    >
                      {persona.type
                        ? persona.type.charAt(0).toUpperCase() + persona.type.slice(1)
                        : "Unknown"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs border ${sizeColors[persona.size] || ""}`}
                    >
                      {persona.size
                        ? persona.size.charAt(0).toUpperCase() + persona.size.slice(1)
                        : "Unknown"}
                    </Badge>
                  </div>
                  {persona.role && (
                    <p className="text-sm text-slate-400 mt-2">{persona.role}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {persona.goals && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Goals</h4>
                    <p className="text-sm text-slate-400">{persona.goals}</p>
                  </div>
                )}
                {persona.frustrations && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Frustrations</h4>
                    <p className="text-sm text-slate-400">{persona.frustrations}</p>
                  </div>
                )}
                {persona.behaviors && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Behaviors</h4>
                    <p className="text-sm text-slate-400">{persona.behaviors}</p>
                  </div>
                )}
              </div>
            </Card>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/50 border-slate-700/50 text-center">
            <p className="text-slate-400">No personas generated yet. Upload documents to get started!</p>
          </Card>
        )}
      </div>

      {/* Persona Statistics */}
      {personas.length > 0 && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h3 className="text-lg font-semibold text-white mb-4">Persona Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Personas</p>
                <p className="text-white font-semibold">{personas.length} generated</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Primary Personas</p>
                <p className="text-white font-semibold">
                  {personas.filter((p) => p.type === "primary").length}
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-slate-400 text-sm mb-1">Coverage</p>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full"
                    style={{ width: `${Math.min(100, personas.length * 20)}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <p className="text-slate-400 text-sm mb-1">Data Quality</p>
                <div className="w-full bg-slate-700/50 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 h-2 rounded-full"
                    style={{ width: "85%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
