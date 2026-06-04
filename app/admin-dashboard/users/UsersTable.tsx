"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Search, ShieldAlert, Edit2, Key, X, Check,
  Copy, Loader2, Trash, ChevronLeft, ChevronRight,
  AlertCircle
} from "lucide-react";
import { updateUserAction, resetUserPasswordAction, deleteUserAction } from "@/app/actions/admin";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface UsersTableProps {
  users: UserItem[];
  currentUser: { userId: string } | null;
  totalUsers: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export default function UsersTable({
  users,
  currentUser,
  totalUsers,
  totalPages,
  currentPage,
  limit
}: UsersTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search & Filter State
  const [searchVal, setSearchVal] = useState(searchParams.get("q") || "");
  const [roleFilter, setRoleFilter] = useState(searchParams.get("role") || "");
  const [pageSize, setPageSize] = useState(limit.toString());

  // Modal State
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [resetUser, setResetUser] = useState<UserItem | null>(null);
  const [deleteUser, setDeleteUser] = useState<UserItem | null>(null);

  // Password Reset Success State
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [resetMessageText, setResetMessageText] = useState("");
  const [copied, setCopied] = useState(false);

  // Edit Action Error State
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editGlobalError, setEditGlobalError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Reset Submitting State
  const [resetSubmitting, setResetSubmitting] = useState(false);

  // Delete Submitting State
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Trigger search / filters
  const applyFilters = (queryStr = searchVal, roleStr = roleFilter, limitStr = pageSize) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (queryStr.trim()) params.set("q", queryStr.trim());
    else params.delete("q");
    
    if (roleStr) params.set("role", roleStr);
    else params.delete("role");
    
    params.set("limit", limitStr);
    params.set("page", "1"); // Reset to page 1

    startTransition(() => {
      router.push(`/admin-dashboard/users?${params.toString()}`);
    });
  };

  // Handle pagination navigation
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    startTransition(() => {
      router.push(`/admin-dashboard/users?${params.toString()}`);
    });
  };

  // Keyboard escape listeners for modals
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEditUser(null);
        setResetUser(null);
        setDeleteUser(null);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Update URL search parameters when debounced/submitted
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
  };

  // Copy-to-clipboard handler
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resetMessageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Edit User Form Submit Handler
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditSubmitting(true);
    setEditErrors({});
    setEditGlobalError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateUserAction({ success: false }, formData);

    setEditSubmitting(false);
    if (result.success) {
      setEditUser(null);
      router.refresh();
    } else {
      if (result.fieldErrors) {
        setEditErrors(result.fieldErrors);
      }
      if (result.error) {
        setEditGlobalError(result.error);
      }
    }
  };

  // Trigger password reset action on server
  const handleConfirmResetPassword = async () => {
    if (!resetUser) return;
    setResetSubmitting(true);
    const result = await resetUserPasswordAction(resetUser.id);
    setResetSubmitting(false);

    if (result.success && result.data) {
      const { tempPassword, name, email } = result.data;
      setGeneratedPassword(tempPassword);
      
      const message = `Hi ${name},\n\nYour Devforge account password has been reset by the system administrator.\n\nTemporary Password: ${tempPassword}\n\nPlease login to Devforge (${window.location.origin}/login) and update your password in your Account Settings.\n\nBest regards,\nDevforge Admin`;
      
      setResetMessageText(message);
    } else {
      alert(result.error || "Failed to reset password.");
      setResetUser(null);
    }
  };

  const closeResetModal = () => {
    setResetUser(null);
    setGeneratedPassword(null);
    setResetMessageText("");
  };

  // Trigger User deletion action on server
  const handleDeleteUser = async () => {
    if (!deleteUser) return;
    setDeleteSubmitting(true);
    
    const result = await deleteUserAction(deleteUser.id);
    
    setDeleteSubmitting(false);
    if (result.success) {
      setDeleteUser(null);
      router.refresh();
    } else {
      alert(result.error || "Failed to delete user.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden">
      
      {/* Header and Filter Controls */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex flex-col md:flex-row gap-4 items-center justify-between">
        <h2 className="text-xl font-bold text-foreground self-start md:self-center">User Accounts Directory</h2>
        
        {/* Filters Form */}
        <form onSubmit={handleSearchSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          
          {/* Search bar */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Role select */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                applyFilters(searchVal, e.target.value, pageSize);
              }}
              className="w-full sm:w-40 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Administrator</option>
              <option value="EMPLOYER">Recruiter</option>
              <option value="CANDIDATE">Candidate</option>
            </select>
          </div>

          {/* Page size limit select */}
          <div className="relative">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(e.target.value);
                applyFilters(searchVal, roleFilter, e.target.value);
              }}
              className="w-full sm:w-24 px-3 py-2 border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
            >
              <option value="5">5 / page</option>
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-hover transition-colors shrink-0 flex items-center justify-center gap-1.5"
          >
            {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            Filter
          </button>
        </form>
      </div>

      {/* Directory Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 text-xs font-bold text-foreground/60 uppercase tracking-wider">
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Email Address</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Registration Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-sm">
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-foreground/50">
                  No registered users match your search criteria.
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const isSelf = currentUser?.userId === user.id;
                return (
                  <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/25 transition-colors">
                    <td className="px-6 py-4 font-bold text-foreground flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        user.role === 'ADMIN' 
                          ? 'bg-red-500/10 text-red-500' 
                          : user.role === 'EMPLOYER'
                          ? 'bg-purple-500/10 text-purple-500'
                          : 'bg-blue-500/10 text-blue-500'
                      }`}>
                        {user.name ? user.name.substring(0, 2).toUpperCase() : "US"}
                      </div>
                      <span>
                        {user.name || "N/A"}
                        {isSelf && <span className="ml-1.5 text-[10px] bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded font-mono">You</span>}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/75 font-mono">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        user.role === "ADMIN" 
                          ? "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60"
                          : user.role === "EMPLOYER"
                          ? "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/60"
                          : "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60"
                      }`}>
                        {user.role === "ADMIN" ? "Admin" : user.role === "EMPLOYER" ? "Recruiter" : "Candidate"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/50">
                      {new Date(user.createdAt).toLocaleDateString(undefined, { 
                        month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" 
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditUser(user)}
                          title="Edit User Details"
                          className="p-1.5 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-primary/30 hover:text-primary transition-all cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setResetUser(user)}
                          title="Reset Password"
                          className="p-1.5 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-yellow-500/30 hover:text-yellow-600 dark:hover:text-yellow-400 transition-all cursor-pointer"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        {!isSelf && (
                          <button
                            onClick={() => setDeleteUser(user)}
                            title="Delete User Account"
                            className="p-1.5 rounded bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:border-red-500/30 hover:text-red-500 transition-all cursor-pointer"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
          <span className="text-sm text-foreground/50 font-medium">
            Showing Page <span className="font-semibold text-foreground">{currentPage}</span> of{" "}
            <span className="font-semibold text-foreground">{totalPages}</span> ({totalUsers} total users)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || isPending}
              className="p-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-950 text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ─── MODAL 1: EDIT DETAILS ─── */}
      {/* ========================================== */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditUser(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-primary" />
                Edit User Account
              </h3>
              <button onClick={() => setEditUser(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Global Errors */}
            {editGlobalError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/50 px-4 py-3 text-sm text-red-650 dark:text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{editGlobalError}</span>
              </div>
            )}

            {/* Edit Form */}
            <form onSubmit={handleEditSubmit} className="mt-5 space-y-5">
              <input type="hidden" name="userId" value={editUser.id} />
              
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  defaultValue={editUser.name || ""}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                    editErrors.name ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                  required
                />
                {editErrors.name && <p className="mt-1.5 text-xs text-red-500 font-semibold">{editErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  defaultValue={editUser.email}
                  className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border ${
                    editErrors.email ? "border-red-500" : "border-gray-200 dark:border-gray-800"
                  } rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15`}
                  required
                />
                {editErrors.email && <p className="mt-1.5 text-xs text-red-500 font-semibold">{editErrors.email}</p>}
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-semibold text-foreground/80 mb-2">Role Type</label>
                <select
                  name="role"
                  defaultValue={editUser.role}
                  disabled={currentUser?.userId === editUser.id}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-foreground focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="CANDIDATE">Candidate</option>
                  <option value="EMPLOYER">Recruiter</option>
                  <option value="ADMIN">Administrator</option>
                </select>
                {currentUser?.userId === editUser.id && (
                  <p className="mt-2 text-xs text-foreground/45 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    You cannot change your own Administrator role.
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setEditUser(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="px-4.5 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  {editSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ─── MODAL 2: PASSWORD RESET ─── */}
      {/* ========================================== */}
      {resetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeResetModal} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Key className="w-5 h-5 text-yellow-550" />
                Reset User Password
              </h3>
              <button onClick={closeResetModal} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Condition 1: Confirm Password Reset */}
            {!generatedPassword ? (
              <div className="mt-5 space-y-4">
                <p className="text-sm text-foreground/75 leading-relaxed">
                  Are you sure you want to reset the password for <strong className="text-foreground">{resetUser.name || resetUser.email}</strong>?
                </p>
                <div className="p-3.5 rounded-lg border border-yellow-200 bg-yellow-50/50 dark:border-yellow-900/30 dark:bg-yellow-900/10 text-xs text-yellow-800 dark:text-yellow-400 flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>This action will generate a new secure password immediately and override their current password. They will be required to log in with the new password.</span>
                </div>
                
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={closeResetModal}
                    className="px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmResetPassword}
                    disabled={resetSubmitting}
                    className="px-4.5 py-2.5 bg-yellow-500 hover:bg-yellow-605 text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-1.5"
                  >
                    {resetSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Generate New Password
                  </button>
                </div>
              </div>
            ) : (
              /* Condition 2: Password Reset Success */
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-400 text-sm flex items-center gap-2 font-semibold">
                  <Check className="w-4 h-4" />
                  <span>Password Reset Successfully!</span>
                </div>
                
                {/* Generated Password Box */}
                <div className="p-4 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-wider">New Password</span>
                    <p className="text-lg font-mono font-bold text-foreground mt-0.5 select-all">{generatedPassword}</p>
                  </div>
                </div>

                {/* Preformatted copy message */}
                <div>
                  <span className="text-xs font-semibold text-foreground/50 block mb-2">Notification message template:</span>
                  <textarea
                    readOnly
                    rows={6}
                    value={resetMessageText}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-xs font-mono text-foreground focus:outline-none resize-none leading-relaxed"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={handleCopy}
                    className="px-4.5 py-2.5 rounded-xl border border-primary/20 hover:border-primary text-primary text-sm font-bold hover:bg-primary/5 transition-all flex items-center gap-1.5"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Message
                      </>
                    )}
                  </button>
                  <button
                    onClick={closeResetModal}
                    className="px-5 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-sm font-bold rounded-xl transition-all shadow-md"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* ─── MODAL 3: DELETE ACCOUNT ─── */}
      {/* ========================================== */}
      {deleteUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeleteUser(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-6 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-start justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Trash className="w-5 h-5 text-red-500" />
                Delete User Account
              </h3>
              <button onClick={() => setDeleteUser(null)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-foreground/50 hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <p className="text-sm text-foreground/75 leading-relaxed">
                Are you sure you want to permanently delete the account for <strong className="text-foreground">{deleteUser.name || deleteUser.email}</strong>?
              </p>
              
              <div className="p-3.5 rounded-lg border border-red-200 bg-red-50/50 dark:border-red-900/30 dark:bg-red-950/20 text-xs text-red-800 dark:text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                <span>This action is permanent and cannot be undone. All associated information (including profile configuration, applied resume links, and job postings) will be permanently cleared from the system database.</span>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-800">
                <button
                  onClick={() => setDeleteUser(null)}
                  className="px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-950 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
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
