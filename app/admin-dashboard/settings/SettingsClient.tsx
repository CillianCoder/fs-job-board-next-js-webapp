"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  User, Lock, FolderTree, PlusCircle, Trash2, Check,
  AlertCircle, Loader2, X, Settings2
} from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  updateAdminProfileAction
} from "@/app/actions/admin";
import { changePasswordAction } from "@/app/actions/settings";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  _count: {
    jobs: number;
  };
}

interface SettingsClientProps {
  adminUser: {
    name: string | null;
    email: string;
  };
  categories: CategoryItem[];
}

export default function SettingsClient({ adminUser, categories }: SettingsClientProps) {
  const router = useRouter();

  // Profile Form States
  const [profileName, setProfileName] = useState(adminUser.name || "");
  const [profileEmail, setProfileEmail] = useState(adminUser.email);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileFieldErrors, setProfileFieldErrors] = useState<Record<string, string>>({});
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Password Form States
  const [pwdValues, setPwdValues] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdFieldErrors, setPwdFieldErrors] = useState<Record<string, string>>({});
  const [pwdSubmitting, setPwdSubmitting] = useState(false);

  // Category Form States
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [catSuccess, setCatSuccess] = useState<string | null>(null);
  const [catError, setCatError] = useState<string | null>(null);
  const [catFieldErrors, setCatFieldErrors] = useState<Record<string, string>>({});
  const [catSubmitting, setCatSubmitting] = useState(false);

  // Category Delete States
  const [deleteCat, setDeleteCat] = useState<CategoryItem | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setProfileSubmitting(true);
    setProfileSuccess(null);
    setProfileError(null);
    setProfileFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await updateAdminProfileAction({ success: false }, formData);

    setProfileSubmitting(false);
    if (result.success) {
      setProfileSuccess(result.message || "Profile updated successfully.");
      router.refresh();
    } else {
      if (result.error) setProfileError(result.error);
      if (result.fieldErrors) setProfileFieldErrors(result.fieldErrors);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPwdSubmitting(true);
    setPwdSuccess(null);
    setPwdError(null);
    setPwdFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await changePasswordAction({ success: false }, formData);

    setPwdSubmitting(false);
    if (result.success) {
      setPwdSuccess(result.message || "Password changed successfully.");
      setPwdValues({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      if (result.error) setPwdError(result.error);
      if (result.fieldErrors) setPwdFieldErrors(result.fieldErrors);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCatSubmitting(true);
    setCatSuccess(null);
    setCatError(null);
    setCatFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await createCategoryAction({ success: false }, formData);

    setCatSubmitting(false);
    if (result.success) {
      setCatSuccess(result.message || "Category created successfully.");
      setCatName("");
      setCatDesc("");
      router.refresh();
    } else {
      if (result.error) setCatError(result.error);
      if (result.fieldErrors) setCatFieldErrors(result.fieldErrors);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCat) return;
    setDeleteSubmitting(true);

    const result = await deleteCategoryAction(deleteCat.id);

    setDeleteSubmitting(false);
    setDeleteCat(null);

    if (result.success) {
      router.refresh();
    } else {
      alert(result.error || "Failed to delete category.");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* ========================================== */}
      {/* ─── LEFT COLUMN: PROFILE & PASSWORD ─── */}
      {/* ========================================== */}
      <div className="space-y-8">
        
        {/* Admin Profile Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Profile Information</h2>
              <p className="text-xs text-foreground/50">Modify your admin display name and email address.</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-650 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                  profileFieldErrors.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                required
              />
              {profileFieldErrors.name && <p className="mt-1 text-xs text-red-500">{profileFieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Email Address</label>
              <input
                type="email"
                name="email"
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                  profileFieldErrors.email ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                required
              />
              {profileFieldErrors.email && <p className="mt-1 text-xs text-red-500">{profileFieldErrors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={profileSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {profileSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Profile Details
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Update Password</h2>
              <p className="text-xs text-foreground/50">Change password credentials for system security.</p>
            </div>
          </div>

          {pwdSuccess && (
            <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{pwdSuccess}</span>
            </div>
          )}

          {pwdError && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-650 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{pwdError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Current Password</label>
              <input
                type="password"
                name="oldPassword"
                value={pwdValues.oldPassword}
                onChange={(e) => setPwdValues({ ...pwdValues, oldPassword: e.target.value })}
                className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                  pwdFieldErrors.oldPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                required
              />
              {pwdFieldErrors.oldPassword && <p className="mt-1 text-xs text-red-500">{pwdFieldErrors.oldPassword}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={pwdValues.newPassword}
                  onChange={(e) => setPwdValues({ ...pwdValues, newPassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                    pwdFieldErrors.newPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                  required
                />
                {pwdFieldErrors.newPassword && <p className="mt-1 text-xs text-red-500">{pwdFieldErrors.newPassword}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={pwdValues.confirmPassword}
                  onChange={(e) => setPwdValues({ ...pwdValues, confirmPassword: e.target.value })}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                    pwdFieldErrors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                  required
                />
                {pwdFieldErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{pwdFieldErrors.confirmPassword}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={pwdSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {pwdSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Change Admin Password
            </button>
          </form>
        </div>

      </div>

      {/* ========================================== */}
      {/* ─── RIGHT COLUMN: CATEGORY MANAGEMENT ─── */}
      {/* ========================================== */}
      <div className="space-y-8">
        
        {/* Add Job Category Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Add Job Category</h2>
              <p className="text-xs text-foreground/50">Inject new category types for recruiters to group listings.</p>
            </div>
          </div>

          {catSuccess && (
            <div className="mb-5 p-3.5 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800/40 rounded-xl text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{catSuccess}</span>
            </div>
          )}

          {catError && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/40 rounded-xl text-sm text-red-650 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{catError}</span>
            </div>
          )}

          <form onSubmit={handleCategorySubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Category Name</label>
              <input
                type="text"
                name="name"
                value={catName}
                placeholder="e.g. Frontend Engineering"
                onChange={(e) => setCatName(e.target.value)}
                className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                  catFieldErrors.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                required
              />
              {catFieldErrors.name && <p className="mt-1 text-xs text-red-500">{catFieldErrors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground/80 mb-1.5">Description (Optional)</label>
              <input
                type="text"
                name="description"
                value={catDesc}
                placeholder="e.g. Roles related to React, Next.js, and CSS"
                onChange={(e) => setCatDesc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15"
              />
            </div>

            <button
              type="submit"
              disabled={catSubmitting}
              className="w-full py-3 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              {catSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Create New Category
            </button>
          </form>
        </div>

        {/* Categories Directory list */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-250 dark:border-gray-850 flex items-center gap-2 shrink-0">
            <Settings2 className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold text-foreground">Categories Listing ({categories.length})</h3>
          </div>

          <div className="divide-y divide-gray-150 dark:divide-gray-850 max-h-96 overflow-y-auto">
            {categories.length === 0 ? (
              <p className="p-6 text-sm text-foreground/50 text-center italic">No job categories defined yet.</p>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="p-5 flex items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                  <div className="overflow-hidden">
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      {cat.name}
                      <span className="font-mono text-[10px] text-foreground/45">/{cat.slug}</span>
                    </h4>
                    <p className="text-xs text-foreground/50 mt-1 truncate">{cat.description || "No description provided."}</p>
                    <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-150 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
                      {cat._count.jobs} Job listings
                    </span>
                  </div>

                  <button
                    onClick={() => setDeleteCat(cat)}
                    title="Delete Category"
                    className="p-2 rounded bg-gray-50 dark:bg-gray-950 border border-gray-205 dark:border-gray-855 text-foreground/50 hover:text-red-500 hover:border-red-200 dark:hover:border-red-900/30 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* ─── DELETE CONFIRM MODAL ─── */}
      {/* ========================================== */}
      {deleteCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteCat(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-4 border-b border-gray-150 dark:border-gray-850">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trash2 className="w-5 h-5 text-red-500" />
                Delete Category
              </h3>
              <button onClick={() => setDeleteCat(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-foreground/75 leading-relaxed">
                Are you sure you want to delete category <strong className="text-foreground">{deleteCat.name}</strong>?
              </p>
              
              <div className="p-3.5 rounded-lg border border-red-250 bg-red-50/50 dark:border-red-950 dark:bg-red-950/20 text-xs text-red-800 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Deleting this category will set the category of any associated job postings to &quot;None&quot; (uncategorized). This action cannot be undone.</span>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-150 dark:border-gray-850">
                <button
                  onClick={() => setDeleteCat(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteSubmitting}
                  className="px-4.5 py-2.5 bg-red-500 hover:bg-red-650 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  {deleteSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm Delete
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
