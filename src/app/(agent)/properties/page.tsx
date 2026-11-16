"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Property, PropertyFormData } from '@/types/property';
import { PropertyForm } from '@/components/agent/PropertyForm';
import {
   Plus,
   Edit2,
   Trash2,
   Home,
   MapPin,
   LayoutGrid,
   List as ListIcon,
  } from 'lucide-react';

type ViewMode = 'grid' | 'list';

function PropertiesContent() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [hierarchyFilter, setHierarchyFilter] = useState<'ALL' | 'MAIN' | 'SUB'>('ALL');
  const searchParams = useSearchParams();

  const openAddForm = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
  };

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      queueMicrotask(() => openAddForm());
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadProperties() {
      try {
        const response = await fetch("/api/property");
        const data = await response.json();
        setProperties(data);
      } catch (error) {
        console.error(error);
      }
    }

    loadProperties();
  }, []);
 
  //HANDLE ADD PROPERTY
  const handleAddProperty = async (data: PropertyFormData) => {
    try {
      const response = await fetch("/api/property", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to create property");
      }

      const newProperty: Property = await response.json();

      setProperties((prev) => [newProperty, ...prev]);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Create property error:", error);
    }
  };

  // HANDLE EDIT PROPERTY
  const handleEditProperty = async (data: PropertyFormData) => {
    if (!editingProperty) return;

    console.log("Sending to API", data);

    try {
      const response = await fetch(
        `/api/property/${editingProperty.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update property");
      }

      const updated: Property = await response.json();

      setProperties((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );

    setEditingProperty(undefined);
    setIsFormOpen(false);

    } catch (error) {
      console.error("Update property error:", error);
    }
  };

  // HANDLE DELETE PROPERTY
  const handleDeleteProperty = async (id: number) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const response = await fetch(`/api/property/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete property");
      }

      setProperties((prev) => 
        prev.filter((p) => p.id !== id)
      );

    } catch (error) {
      console.error(error);
    }
  };

  // OPEN EDIT PROPERTY FORM
  const openEditForm = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const filteredProperties = properties.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesHierarchy =
      hierarchyFilter === 'ALL' ||
      (hierarchyFilter === 'MAIN' && !p.parentPropertyId) ||
      (hierarchyFilter === 'SUB' && Boolean(p.parentPropertyId));
    return matchesStatus && matchesHierarchy;
  });

  const mainPropertiesList = properties.filter((p) => !p.parentPropertyId);

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-neutral-200/60 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">Properties & Sub-Units</h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage multi-unit portfolios (e.g. 10 Dunvegan with sub-divisions 2.1, 2.2, 2.3) and independent tenant listings.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Hierarchy Filter Toggle */}
          <div className="flex items-center bg-[#f4f3ef] dark:bg-slate-800 p-1 rounded-full border border-neutral-200/80 dark:border-slate-700">
            <button
              onClick={() => setHierarchyFilter('ALL')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                hierarchyFilter === 'ALL'
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              All ({properties.length})
            </button>
            <button
              onClick={() => setHierarchyFilter('MAIN')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                hierarchyFilter === 'MAIN'
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Main ({mainPropertiesList.length})
            </button>
            <button
              onClick={() => setHierarchyFilter('SUB')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                hierarchyFilter === 'SUB'
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
            >
              Sub-Units ({properties.length - mainPropertiesList.length})
            </button>
          </div>

          {/* View Mode Toggle Icons (Grid vs List) */}
          <div className="flex items-center bg-[#f4f3ef] dark:bg-slate-800 p-1 rounded-full border border-neutral-200/80 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-full text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-full text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
              }`}
              title="List View"
            >
              <ListIcon size={15} />
            </button>
          </div>

          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135446] hover:bg-[#0f4438] text-white text-xs font-bold rounded-full shadow-xs transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        </div>
      </div>

      {/* Property Status Filter Bar */}
      <div className="flex gap-2 pb-1 overflow-x-auto no-scrollbar">
        {['ALL', 'AVAILABLE', 'OCCUPIED', 'UNDER_MAINTENANCE', 'INACTIVE'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all whitespace-nowrap ${
              statusFilter === status
                ? 'bg-neutral-900 text-white shadow-xs dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-white dark:bg-slate-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 border border-neutral-200/60 dark:border-slate-800'
            }`}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Property Display Section */}
      {filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 border border-dashed border-neutral-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900/60">
          <div className="bg-[#135446]/10 text-[#135446] p-4 rounded-full mb-4">
            <Home size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white mb-1">No properties found</h3>
          <p className="text-xs text-neutral-500 max-w-md text-center mb-6">
            No properties match the selected hierarchy or status filter.
          </p>
          <button
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#135446] text-white text-xs font-bold rounded-full shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>Add Property</span>
          </button>
        </div>
      ) : (
        <>
          {/* GRID VIEW */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id} 
                  className="group bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-slate-800 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-neutral-900 text-white font-mono">
                            {property.propertyCode}
                          </span>
                          <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full
                            ${property.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 
                              property.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :  
                              'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}
                          >
                            {property.status}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-neutral-900 dark:text-white mt-2">
                          {property.propertyName}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditForm(property)}
                          className="p-1.5 text-neutral-400 hover:text-[#135446] rounded-full hover:bg-neutral-100 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDeleteProperty(property.id)}
                          className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-full hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5 mb-3 line-clamp-1">
                      <MapPin size={13} className="shrink-0 text-neutral-400" />
                      {[property.address, property.city].filter(Boolean).join(", ")}
                    </p>

                    {/* Hierarchy Tags */}
                    {property.childProperties && property.childProperties.length > 0 && (
                      <div className="mb-3 p-2.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 text-[11px] text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                        <span className="font-semibold">🏢 {property.childProperties.length} Sub-Divisions</span>
                        <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">
                          {property.childProperties.map((c) => c.propertyCode).join(", ")}
                        </span>
                      </div>
                    )}

                    {property.parentProperty && (
                      <div className="mb-3 p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
                        ↳ Unit of <span className="font-bold">{property.parentProperty.propertyName}</span> (ID: {property.parentProperty.propertyCode})
                      </div>
                    )}
                  </div>

                  <div className="p-4 px-6 border-t border-neutral-100 dark:border-slate-800/80 bg-neutral-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs">
                    <span className="text-neutral-400 font-medium">Monthly Rent</span>
                    <span className="font-extrabold text-neutral-900 dark:text-white">
                      R{Number(property.price || 0).toLocaleString("en-ZA")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {viewMode === 'list' && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-neutral-200/60 dark:border-slate-800 divide-y divide-neutral-100 dark:divide-slate-800 overflow-hidden">
              {filteredProperties.map((property) => (
                <div 
                  key={property.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-neutral-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-neutral-100 dark:bg-slate-800 rounded-2xl text-neutral-400 shrink-0">
                      <Home size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-neutral-900 text-white font-mono">
                          {property.propertyCode}
                        </span>
                        <h3 className="font-bold text-neutral-900 dark:text-white text-sm">
                          {property.propertyName}
                        </h3>
                        {property.childProperties && property.childProperties.length > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {property.childProperties.length} Units
                          </span>
                        )}
                        {property.parentProperty && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                            ↳ Unit of {property.parentProperty.propertyCode}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        {[property.address, property.city].filter(Boolean).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <span className="font-bold text-neutral-900 dark:text-white text-xs">
                      R{Number(property.price || 0).toLocaleString("en-ZA")}
                    </span>
                    <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full
                      ${property.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 
                        property.status === 'OCCUPIED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :  
                        'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}
                    >
                      {property.status}
                    </span>
                    <div className="flex items-center gap-1 border-l border-neutral-200 dark:border-slate-800 pl-3">
                      <button 
                        onClick={() => openEditForm(property)}
                        className="p-1.5 text-neutral-400 hover:text-[#135446] rounded-lg transition-colors"
                        title="Edit Property"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProperty(property.id)}
                        className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Form Modal */}
      {isFormOpen && (
        <PropertyForm
          initialData={editingProperty}
          onSubmit={editingProperty ? handleEditProperty : handleAddProperty}
          onCancel={() => setIsFormOpen(false)}
          mainProperties={mainPropertiesList}
        />
      )}

      
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 animate-pulse">Loading properties...</div>}>
      <PropertiesContent />
    </Suspense>
  );
}
