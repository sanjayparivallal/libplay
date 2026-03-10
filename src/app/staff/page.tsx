"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import UploadForm from "@/components/UploadForm";
import MediaCard from "@/components/MediaCard";
import { MediaItem } from "@/lib/types";
import {
  Upload,
  FolderOpen,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface User {
  userId: string;
  name: string;
  role: string;
}

export default function StaffPage() {
  const [user, setUser] = useState<User | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upload" | "my-uploads">(
    "upload"
  );
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      fetchMyMedia();
      fetchStats();
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data.success) {
        setUser(data.data.user);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  const fetchMyMedia = async () => {
    try {
      const res = await fetch("/api/media?limit=50");
      const data = await res.json();
      if (data.success) {
        setMedia(data.data.media);
      }
    } catch (error) {
      console.error("Failed to fetch media:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/media/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 px-4 sm:px-6 lg:px-8 py-8 mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center border border-white/20 shadow-sm shrink-0">
            <Upload className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Staff Dashboard</h1>
            <p className="text-primary-100 text-sm mt-0.5 font-medium">
              Upload photos and videos from library events
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-gray-100 shadow-md shadow-gray-200/50 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 group border-l-4 border-l-amber-500">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center group-hover:bg-amber-100 transition-colors">
              <Clock className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800 leading-none">{stats.pending}</p>
              <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Pending</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 shadow-md shadow-gray-200/50 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 group border-l-4 border-l-emerald-500">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800 leading-none">{stats.approved}</p>
              <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Approved</p>
            </div>
          </div>
          <div className="bg-white border border-gray-100 shadow-md shadow-gray-200/50 rounded-2xl p-5 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300 group border-l-4 border-l-rose-500">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center group-hover:bg-rose-100 transition-colors">
              <XCircle className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-3xl font-extrabold text-gray-800 leading-none">{stats.rejected}</p>
              <p className="text-xs font-semibold text-gray-400 mt-1 uppercase tracking-wider">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Tabs */}
        <div className="flex gap-1 mx-auto bg-gray-100/80 backdrop-blur p-1.5 rounded-2xl mb-8 max-w-md">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "upload"
              ? "bg-white shadow-md text-primary-700"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <Upload className="w-4 h-4" />
            Upload New
          </button>
          <button
            onClick={() => setActiveTab("my-uploads")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === "my-uploads"
              ? "bg-white shadow-md text-primary-700"
              : "text-gray-400 hover:text-gray-600"
              }`}
          >
            <FolderOpen className="w-4 h-4" />
            My Uploads ({media.length})
          </button>
        </div>

        {/* Content */}
        {activeTab === "upload" ? (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="glass-card rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-800 mb-1">Upload Media</h2>
              <p className="text-sm text-gray-400 mb-6">
                Uploaded media will be reviewed by the librarian before display
              </p>
              <UploadForm
                onUploadSuccess={() => {
                  fetchMyMedia();
                  fetchStats();
                }}
              />
            </div>
          </div>
        ) : (
          <div className="animate-fade-in">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : media.length === 0 ? (
              <div className="text-center py-20 glass-card rounded-2xl">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-lg font-semibold text-gray-500">
                  No uploads yet
                </h3>
                <p className="text-gray-400 mt-1 text-sm">
                  Switch to the Upload tab to add your first media
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {media.map((item, i) => (
                  <div key={item.id} className="animate-scale-in" style={{ animationDelay: `${i * 60}ms` }}>
                    <MediaCard media={item} mode="staff" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
