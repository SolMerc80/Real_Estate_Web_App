"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  UserCheck,
  Mail,
  Phone,
  Building2,
  Percent,
  User,
  FileText,
  Search,
  LayoutGrid,
  List as ListIcon,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Tag,
  Briefcase,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Landlord, LandlordFormData } from "@/types/landlord";
import { LandlordForm } from "@/components/agent/LandlordForm";

type ViewMode = "grid" | "list";

export default function LandlordsPage() {
  const [landlords, setLandlords] = useState<Landlord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState<Landlord | undefined>(undefined);

  // Load Landlords
  const loadLandlords = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/landlord");
      if (res.ok) {
        const data = await res.json();
        setLandlords(data);
      }
    } catch (err) {
      console.error("Error fetching landlords:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLandlords();
  }, []);

  // Handle Add Landlord
  const handleAddLandlord = async (data: LandlordFormData) => {
    const res = await fetch("/api/landlord", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to create landlord");
    }

    await loadLandlords();
    setIsFormOpen(false);
  };

  // Handle Edit Landlord
  const handleEditLandlord = async (data: LandlordFormData) => {
    if (!editingLandlord) return;

    const res = await fetch(`/api/landlord/${editingLandlord.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.message || "Failed to update landlord");
    }

    await loadLandlords();
    setEditingLandlord(undefined);
    setIsFormOpen(false);
  };

  // Handle Delete Landlord
  const handleDeleteLandlord = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this landlord record? Associated properties will be unlinked."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/landlord/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete landlord");
      }

      setLandlords((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Error deleting landlord:", err);
      alert("Failed to delete landlord");
    }
  };

  // Search & Filtering
  const filteredLandlords = useMemo(() => {
    if (!searchQuery.trim()) return landlords;
    const q = searchQuery.toLowerCase();

    return landlords.filter((landlord) => {
      const name = landlord.displayName.toLowerCase();
      const email = (landlord.email || "").toLowerCase();
      const phone = (landlord.phoneNumber || "").toLowerCase();
      const notes = (landlord.notes || "").toLowerCase();

      // Check linked properties for match (ID/code, address, managing agent)
      const propMatch = (landlord.properties || []).some((p) => {
        const pCode = (p.propertyCode || "").toLowerCase();
        const pName = (p.propertyName || "").toLowerCase();
        const pAddr = (p.address || "").toLowerCase();
        const pAgent = (p.managingAgent || "").toLowerCase();
        return (
          pCode.includes(q) ||
          pName.includes(q) ||
          pAddr.includes(q) ||
          pAgent.includes(q)
        );
      });

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        notes.includes(q) ||
        propMatch
      );
    });
  }, [landlords, searchQuery]);

  // Key KPI stats
  const totalLandlords = landlords.length;
  const propertiesLinked = landlords.reduce(
    (acc, l) => acc + (l.properties?.length || 0),
    0
  );
  const avgCommission = useMemo(() => {
    const listWithRate = landlords.filter(
      (l) => l.commissionRate !== null && l.commissionRate !== undefined
    );
    if (!listWithRate.length) return "0.0";
    const sum = listWithRate.reduce(
      (acc, l) => acc + Number(l.commissionRate || 0),
      0
    );
    return (sum / listWithRate.length).toFixed(1);
  }, [landlords]);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Landlords
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
              {totalLandlords} Total
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage landlord profiles, property assignments, commission rates, and managing agents.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Grid</span>
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                viewMode === "list"
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
              title="List View"
            >
              <ListIcon size={16} />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          <button
            onClick={() => {
              setEditingLandlord(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Plus size={18} />
            Add Landlord
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Landlords
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {totalLandlords}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
            <UserCheck size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Assigned Properties
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {propertiesLinked}
            </h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Building2 size={22} />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/90 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Avg. Commission
            </p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
              {avgCommission}%
            </h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
            <Percent size={22} />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-500" />
          <span>Showing {filteredLandlords.length} of {landlords.length} landlords</span>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-80">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search landlord, property ID, agent, address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-12">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800/50 animate-pulse border border-slate-200/50 dark:border-slate-800"
            />
          ))}
        </div>
      ) : filteredLandlords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/40 text-center">
          <div className="bg-blue-50 dark:bg-blue-950/60 p-4 rounded-full mb-4 text-blue-600 dark:text-blue-400">
            <UserCheck size={36} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">
            {searchQuery ? "No matching landlords found" : "No landlords registered yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-sm mb-6">
            {searchQuery
              ? "Try adjusting your search terms or clearing the filter."
              : "Create your first landlord profile to link properties, track commission rates, and assign managing agents."}
          </p>
          <button
            onClick={() => {
              setEditingLandlord(undefined);
              setIsFormOpen(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-xl shadow-sm transition-all"
          >
            <Plus size={16} />
            Add First Landlord
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === "grid" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLandlords.map((landlord) => {
                const mainProperty = landlord.properties?.[0];
                return (
                  <div
                    key={landlord.id}
                    className="group bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-blue-500/40 dark:hover:border-blue-500/40 shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                  >
                    <div className="p-5 space-y-4">
                      {/* Card Top: Landlord Name & Commission */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                              {landlord.displayName.charAt(0).toUpperCase()}
                            </span>
                            <span className="truncate">{landlord.displayName}</span>
                          </h3>
                        </div>

                        {/* Commission Badge */}
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60 shrink-0">
                          <Percent size={12} />
                          {landlord.commissionRate !== null && landlord.commissionRate !== undefined
                            ? `${landlord.commissionRate}%`
                            : "0%"} Comm.
                        </span>
                      </div>

                      {/* Contact Info: Phone & Email */}
                      <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                        {landlord.phoneNumber ? (
                          <div className="flex items-center gap-2">
                            <Phone size={13} className="text-emerald-500 shrink-0" />
                            <a
                              href={`tel:${landlord.phoneNumber}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate"
                            >
                              {landlord.phoneNumber}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Phone size={13} className="shrink-0" />
                            <span>No phone listed</span>
                          </div>
                        )}

                        {landlord.email ? (
                          <div className="flex items-center gap-2">
                            <Mail size={13} className="text-indigo-500 shrink-0" />
                            <a
                              href={`mailto:${landlord.email}`}
                              className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline truncate"
                            >
                              {landlord.email}
                            </a>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-400">
                            <Mail size={13} className="shrink-0" />
                            <span>No email listed</span>
                          </div>
                        )}
                      </div>

                      {/* Property Association & Managing Agent Section */}
                      <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-2">
                        {mainProperty ? (
                          <>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
                                <Tag size={13} className="text-blue-500" />
                                <span>Property ID:</span>
                                <span className="px-1.5 py-0.5 rounded bg-blue-100/70 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[11px]">
                                  {mainProperty.propertyCode}
                                </span>
                              </div>
                              <span className="text-[11px] font-medium text-slate-500 truncate max-w-[120px]">
                                {mainProperty.propertyName}
                              </span>
                            </div>

                            <div className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                              <MapPin size={13} className="text-blue-500 shrink-0 mt-0.5" />
                              <span className="line-clamp-2">
                                {mainProperty.address}
                                {mainProperty.city ? `, ${mainProperty.city}` : ""}
                              </span>
                            </div>

                            {/* Managing Agent */}
                            <div className="pt-1 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                              <span className="text-slate-400 text-[11px] flex items-center gap-1">
                                <Briefcase size={12} className="text-purple-500" />
                                Managing Agent:
                              </span>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {mainProperty.managingAgent || "Unassigned"}
                              </span>
                            </div>
                          </>
                        ) : (
                          <div className="text-center py-2 text-xs text-slate-400">
                            <p>No property linked yet</p>
                          </div>
                        )}
                      </div>

                      {/* Notes snippet */}
                      {landlord.notes && (
                        <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-amber-50/40 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-100/50 dark:border-amber-900/30">
                          <FileText size={13} className="text-amber-500 shrink-0 mt-0.5" />
                          <p className="line-clamp-2 italic">{landlord.notes}</p>
                        </div>
                      )}
                    </div>

                    {/* Card Actions Footer */}
                    <div className="px-5 py-3 bg-slate-50/60 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {landlord.properties?.length || 0}{" "}
                        {landlord.properties?.length === 1 ? "Property" : "Properties"}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingLandlord(landlord);
                            setIsFormOpen(true);
                          }}
                          className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Edit Landlord"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteLandlord(landlord.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title="Delete Landlord"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LIST VIEW (Full Table) */}
          {viewMode === "list" && (
            <div className="bg-white dark:bg-slate-900/90 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse border-spacing-0">
                  <thead>
                    <tr className="border-b-2 border-slate-300 dark:border-slate-700 bg-slate-100/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold uppercase tracking-wider">
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Landlord</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Contact Details</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Property ID & Name</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Property Address</th>
                      <th className="py-3.5 px-4 text-center border-r border-slate-200 dark:border-slate-700/80">% Commission</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Managing Agent</th>
                      <th className="py-3.5 px-4 border-r border-slate-200 dark:border-slate-700/80">Notes</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-2 divide-slate-200 dark:divide-slate-800">
                    {filteredLandlords.map((landlord) => {
                      const mainProperty = landlord.properties?.[0];
                      return (
                        <tr
                          key={landlord.id}
                          className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors"
                        >
                          {/* Landlord Name */}
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs shrink-0">
                                {landlord.displayName.charAt(0).toUpperCase()}
                              </span>
                              <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                                {landlord.displayName}
                              </span>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="space-y-1">
                              {landlord.phoneNumber ? (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <Phone size={12} className="text-emerald-500 shrink-0" />
                                  <span>{landlord.phoneNumber}</span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">No phone</span>
                              )}
                              {landlord.email && (
                                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                  <Mail size={12} className="text-indigo-500 shrink-0" />
                                  <span>{landlord.email}</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Property ID */}
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">
                            {mainProperty ? (
                              <div>
                                <span className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-900">
                                  {mainProperty.propertyCode}
                                </span>
                                <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                                  {mainProperty.propertyName}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">None</span>
                            )}
                          </td>

                          {/* Property Address */}
                          <td className="py-3 px-4 max-w-[200px] border-r border-slate-200 dark:border-slate-800">
                            {mainProperty ? (
                              <div className="flex items-start gap-1 text-slate-600 dark:text-slate-300">
                                <MapPin size={12} className="text-blue-500 shrink-0 mt-0.5" />
                                <span className="line-clamp-2">
                                  {mainProperty.address}
                                  {mainProperty.city ? `, ${mainProperty.city}` : ""}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">-</span>
                            )}
                          </td>

                          {/* % Commission */}
                          <td className="py-3 px-4 text-center border-r border-slate-200 dark:border-slate-800">
                            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-900/60">
                              {landlord.commissionRate !== null && landlord.commissionRate !== undefined
                                ? `${landlord.commissionRate}%`
                                : "0%"}
                            </span>
                          </td>

                          {/* Managing Agent */}
                          <td className="py-3 px-4 border-r border-slate-200 dark:border-slate-800">
                            <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                              <Briefcase size={13} className="text-purple-500 shrink-0" />
                              <span>{mainProperty?.managingAgent || "Unassigned"}</span>
                            </div>
                          </td>

                          {/* Notes */}
                          <td className="py-3 px-4 max-w-[180px] border-r border-slate-200 dark:border-slate-800">
                            {landlord.notes ? (
                              <span className="line-clamp-2 text-slate-500 dark:text-slate-400 italic">
                                {landlord.notes}
                              </span>
                            ) : (
                              <span className="text-slate-400">-</span>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingLandlord(landlord);
                                  setIsFormOpen(true);
                                }}
                                className="p-1.5 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteLandlord(landlord.id)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Landlord Modal */}
      {isFormOpen && (
        <LandlordForm
          initialData={editingLandlord}
          onSubmit={editingLandlord ? handleEditLandlord : handleAddLandlord}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingLandlord(undefined);
          }}
        />
      )}
    </div>
  );
}
