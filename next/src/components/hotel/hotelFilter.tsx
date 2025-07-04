"use client";

import { useCallback, ChangeEvent } from "react";
import filters from "@/db/hotelFilter.json";
import { FaStar } from "react-icons/fa";

export type PriceRange = {
  min: number;
  max: number;
};

export interface FilterState {
  searchText: string;
  selectedPriceRanges: PriceRange[];
  selectedStarRatings: string[];
  selectedPropertyTypes: string[];
}

type HotelFilterProps = {
  filterState: FilterState;
  onFilterChange: (state: FilterState) => void;
};

export default function HotelFilter({ filterState, onFilterChange }: HotelFilterProps) {
  // Handlers for each filter
  const handleSearchTextChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filterState, searchText: e.target.value });
  }, [filterState, onFilterChange]);

  const handlePriceRangeChange = useCallback((value: PriceRange) => {
    const exists = filterState.selectedPriceRanges.some(
      (v) => v.min === value.min && v.max === value.max
    );
    const updated = exists
      ? filterState.selectedPriceRanges.filter((v) => !(v.min === value.min && v.max === value.max))
      : [...filterState.selectedPriceRanges, value];
    onFilterChange({ ...filterState, selectedPriceRanges: updated });
  }, [filterState, onFilterChange]);

  const handleStarRatingChange = useCallback((value: string) => {
    const updated = filterState.selectedStarRatings.includes(value)
      ? filterState.selectedStarRatings.filter((v) => v !== value)
      : [...filterState.selectedStarRatings, value];
    onFilterChange({ ...filterState, selectedStarRatings: updated });
  }, [filterState, onFilterChange]);

  const clearAllFilters = useCallback(() => {
    onFilterChange({
      searchText: "",
      selectedPriceRanges: [],
      selectedStarRatings: [],
      selectedPropertyTypes: [],
    });
  }, [onFilterChange]);

  return (
    <div className="filters_sidebar p-4 bg-white rounded-lg shadow space-y-6">
      <div className="flex justify-between border-b pb-1 items-center">
        <h5 className="text-lg font-semibold text-zinc-800">Filter Search</h5>
        <button
          onClick={clearAllFilters}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
        >
          Clear
        </button>
      </div>

      {/* Search */}
      <div>
        <h5 className="text-base text-zinc-700 font-medium mb-2">Search</h5>
        <input
          className="w-full py-2 px-3 border rounded-md outline-none text-sm focus:border-stone-400 focus:ring-2 focus:ring-blue-100 transition"
          type="text"
          value={filterState.searchText}
          onChange={handleSearchTextChange}
          placeholder="Search by hotel name"
        />
      </div>

      {/* Price Range */}
      <div>
        <h5 className="text-base text-zinc-700 font-medium mb-2">Price Range</h5>
        {filters.priceRange.map((range: { value: PriceRange; name: string }, index: number) => (
          <label key={index} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition">
            <input
              type="checkbox"
              checked={filterState.selectedPriceRanges.some(v => v.min === range.value.min && v.max === range.value.max)}
              onChange={() => handlePriceRangeChange(range.value)}
              className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
            />
            <span className="text-slate-600 text-sm">{range.name}</span>
          </label>
        ))}
      </div>

      {/* Star Ratings */}
      <div>
        <h5 className="text-base text-zinc-700 font-medium mb-2">Rates</h5>
        {filters.starRating.map((rating: { value: string; name: string }, index: number) => (
          <div key={index} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition">
            <input
              type="checkbox"
              id={`star-${rating.value}`}
              checked={filterState.selectedStarRatings.includes(rating.value)}
              onChange={() => handleStarRatingChange(rating.value)}
              className="form-checkbox h-4 w-4 text-blue-600 accent-yellow-400"
            />
            <label
              htmlFor={`star-${rating.value}`}
              className="flex items-center text-slate-600 text-sm select-none"
            >
              {[...Array(parseInt(rating.value))].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
              <span className="ml-1">{rating.name}</span>
            </label>
          </div>
        ))}
      </div>

      {/* Property Type - Commented out for now */}
      {/*
      <div>
        <h5 className="text-base text-zinc-700 font-medium mb-2">Property Type</h5>
        {filters.PropertyTypeFilters.map((type: { value: string; name: string }, index: number) => (
          <label key={index} className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-blue-50 px-2 py-1 rounded transition">
            <input
              type="checkbox"
              checked={filterState.selectedPropertyTypes.includes(type.value)}
              onChange={() => handlePropertyTypeChange(type.value)}
              className="form-checkbox h-4 w-4 text-blue-600 accent-blue-600"
            />
            <span className="text-slate-600 text-sm">{type.name}</span>
          </label>
        ))}
      </div>
      */}
    </div>
  );
}
