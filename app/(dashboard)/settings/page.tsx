"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Bell, Lock, User, Zap, LogOut } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [formData, setFormData] = useState({
    fullName: "John Doe",
    email: "demo@example.com",
    company: "Tech Corp",
    role: "Product Manager",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    weeklyReport: true,
    insightAlerts: true,
    newOpportunities: true,
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [field]: !prev[field] }));
  };


  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "billing", label: "Billing", icon: Zap },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700/50 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              className="justify-start gap-2 border-b-2 rounded-none"
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-slate-800/50 border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Profile Information</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullname" className="text-slate-300 mb-2 block">
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-slate-300 mb-2 block">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="company" className="text-slate-300 mb-2 block">
                    Company
                  </Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange("company", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="text-slate-300 mb-2 block">
                    Role
                  </Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value)}
                    className="bg-slate-700/50 border-slate-600 text-white"
                  />
                </div>
              </div>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Save Changes
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h3 className="text-lg font-semibold text-white mb-4">Profile Picture</h3>
            <div className="w-20 h-20 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">JD</span>
            </div>
            <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white">
              Upload Photo
            </Button>
          </Card>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <Card className="p-6 bg-slate-800/50 border-slate-700/50">
          <h2 className="text-lg font-semibold text-white mb-6">Notification Preferences</h2>
          <div className="space-y-4">
            {(
              [
                { key: "emailNotifications" as const, label: "Email Notifications", description: "Receive updates via email" },
                { key: "weeklyReport" as const, label: "Weekly Report", description: "Get a summary every Monday" },
                { key: "insightAlerts" as const, label: "Insight Alerts", description: "Notify on new high-confidence insights" },
                { key: "newOpportunities" as const, label: "New Opportunities", description: "Alert on newly identified opportunities" },
              ] as const
            ).map((item) => (
              <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg border border-slate-700/50">
                <div>
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-sm text-slate-400">{item.description}</p>
                </div>
                <button
                  onClick={() => handleNotificationChange(item.key)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications[item.key]
                      ? "bg-indigo-600"
                      : "bg-slate-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications[item.key] ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Security Tab */}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Change Password</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="current-password" className="text-slate-300 mb-2 block">
                  Current Password
                </Label>
                <Input
                  id="current-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="new-password" className="text-slate-300 mb-2 block">
                  New Password
                </Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="confirm-password" className="text-slate-300 mb-2 block">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Update Password
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Security Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Password Strength</span>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/30">Strong</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Two-Factor Auth</span>
                <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/30">Disabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Last Login</span>
                <span className="text-white">Today at 2:34 PM</span>
              </div>
              <Button variant="outline" className="w-full mt-4 border-slate-600 text-slate-300 hover:text-white">
                Enable Two-Factor Authentication
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Billing Tab */}
      {activeTab === "billing" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Current Plan</h2>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/30 rounded-lg border border-indigo-500/30">
                <p className="text-slate-400 text-sm mb-1">Active Subscription</p>
                <p className="text-2xl font-bold text-white">Professional</p>
                <p className="text-indigo-400 text-sm mt-2">$99/month</p>
              </div>
              <div className="text-sm text-slate-400 space-y-1">
                <p>✓ Unlimited projects</p>
                <p>✓ AI-powered insights</p>
                <p>✓ Advanced analytics</p>
                <p>✓ Priority support</p>
              </div>
              <Button variant="outline" className="w-full border-slate-600 text-slate-300 hover:text-white">
                Upgrade Plan
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-slate-800/50 border-slate-700/50">
            <h2 className="text-lg font-semibold text-white mb-6">Billing History</h2>
            <div className="space-y-3">
              {[
                { date: "Mar 15, 2024", amount: "$99.00", status: "Paid" },
                { date: "Feb 15, 2024", amount: "$99.00", status: "Paid" },
                { date: "Jan 15, 2024", amount: "$99.00", status: "Paid" },
              ].map((bill, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="text-white text-sm">{bill.date}</p>
                    <p className="text-slate-400 text-xs">Invoice</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-semibold">{bill.amount}</span>
                    <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-xs">
                      {bill.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Danger Zone */}
      <Card className="p-6 bg-red-500/10 border-red-500/30">
        <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <p className="text-sm text-slate-400">
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="outline"
            className="border-red-500/30 text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full border-slate-600 text-slate-300 hover:text-white justify-start gap-2"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </Button>
    </div>
  );
}
