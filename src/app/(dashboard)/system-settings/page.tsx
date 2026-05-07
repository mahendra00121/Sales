"use client";

import { useState, useEffect } from "react";
import { fetchWithAuth } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Settings, Shield, Mail, Building, Save, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type SystemSetting = {
  settingKey: string;
  settingValue: string;
  description: string;
  group: string;
};

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});

  const fetchSettings = async () => {
    try {
      const response = await fetchWithAuth("/SystemSetting");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        const initialValues: { [key: string]: string } = {};
        data.forEach((s: SystemSetting) => {
          initialValues[s.settingKey] = s.settingValue;
        });
        setEditedValues(initialValues);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleUpdate = async (key: string) => {
    setIsSaving(true);
    const setting = settings.find((s) => s.settingKey === key);
    if (!setting) return;

    try {
      const response = await fetchWithAuth(`/SystemSetting/${key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...setting,
          settingValue: editedValues[key],
        }),
      });

      if (response.ok) {
        alert(`${key} updated successfully!`);
        fetchSettings();
      } else {
        alert("Failed to update setting");
      }
    } catch (error) {
      console.error("Update Error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const groups = Array.from(new Set(settings.map((s) => s.group)));

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" /> System Parameters
          </h1>
          <p className="text-muted-foreground mt-1">Configure global system behavior and business rules.</p>
        </div>
        <Button onClick={fetchSettings} variant="outline" size="icon" className="rounded-xl">
            <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {groups.map((group) => (
          <div key={group} className="space-y-4">
            <div className="flex items-center gap-2 px-2">
                {group === "Security" && <Shield className="h-5 w-5 text-blue-600" />}
                {group === "Company" && <Building className="h-5 w-5 text-blue-600" />}
                {group === "System" && <Settings className="h-5 w-5 text-blue-600" />}
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{group} Settings</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {settings
                .filter((s) => s.group === group)
                .map((setting) => (
                  <Card key={setting.settingKey} className="border-none shadow-lg bg-white dark:bg-slate-900/50 hover:shadow-xl transition-shadow duration-300">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between mb-1">
                        <CardTitle className="text-sm font-black text-blue-600 uppercase tracking-widest">
                            {setting.settingKey.replace(/_/g, " ")}
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-bold opacity-50">{group}</Badge>
                      </div>
                      <CardDescription className="text-xs font-medium leading-relaxed">
                        {setting.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Input
                          value={editedValues[setting.settingKey] || ""}
                          onChange={(e) =>
                            setEditedValues({
                              ...editedValues,
                              [setting.settingKey]: e.target.value,
                            })
                          }
                          className="h-12 rounded-xl border-slate-100 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-950 transition-all font-bold"
                        />
                        <Button
                          onClick={() => handleUpdate(setting.settingKey)}
                          disabled={isSaving || editedValues[setting.settingKey] === setting.settingValue}
                          className="h-12 w-12 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 dark:shadow-none p-0"
                        >
                          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-5 w-5" />}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
