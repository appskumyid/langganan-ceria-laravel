
import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

interface SubscriptionFiltersProps {
  searchTerm: string;
  onSearchChange: (search: string) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rows: number) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const SubscriptionFilters = ({
  searchTerm,
  onSearchChange,
  rowsPerPage,
  onRowsPerPageChange,
  statusFilter,
  onStatusFilterChange
}: SubscriptionFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="search"
          placeholder="Cari pelanggan / produk..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          <SelectItem value="pending_payment">Pending Payment</SelectItem>
          <SelectItem value="waiting_confirmation">Waiting Confirmation</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Rows Per Page */}
      <Select value={rowsPerPage.toString()} onValueChange={(value) => onRowsPerPageChange(parseInt(value))}>
        <SelectTrigger className="w-full sm:w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="10">10 baris</SelectItem>
          <SelectItem value="25">25 baris</SelectItem>
          <SelectItem value="50">50 baris</SelectItem>
          <SelectItem value="100">100 baris</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
