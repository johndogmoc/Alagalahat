"use client";

interface FeedFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

import { IconHome, IconSyringe, IconPaw, IconAlertTriangle, IconBarangaySeal } from "@/components/icons";

const filters = [
  { id: "all", label: "All Posts", icon: <IconHome size={16} /> },
  { id: "vaccination", label: "Vaccinations", icon: <IconSyringe size={16} /> },
  { id: "lost", label: "Lost & Found", icon: <IconAlertTriangle size={16} /> },
  { id: "regular", label: "Pet Stories", icon: <IconPaw size={16} /> },
  { id: "tip", label: "Barangay Updates", icon: <IconBarangaySeal size={16} /> },
];

export function FeedFilters({ activeFilter, onFilterChange }: FeedFiltersProps) {
  return (
    <div className="feed-filters" role="tablist" aria-label="Feed filters">
      {filters.map((f) => (
        <button
          key={f.id}
          type="button"
          role="tab"
          aria-selected={activeFilter === f.id}
          className={`feed-filter-btn ${activeFilter === f.id ? "active" : ""}`}
          onClick={() => onFilterChange(f.id)}
        >
          <span>{f.icon}</span>
          <span>{f.label}</span>
        </button>
      ))}
    </div>
  );
}
