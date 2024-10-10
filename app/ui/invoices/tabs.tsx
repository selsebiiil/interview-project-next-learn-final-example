// components/Tabs.tsx
"use client";

import Link from "next/link";
import { useState } from "react";

type Tab = {
  label: string;
  value: string;
};

interface TabsProps {
  tabs: Tab[];
  selectedTab: string;
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Tabs({ tabs, selectedTab, searchParams }: TabsProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Toggle the dropdown on mobile
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);

  return (
    <div className="mt-4 flex flex-col sm:flex-row sm:space-x-4">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <button
          onClick={toggleDropdown}
          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-md w-full text-left"
        >
          {tabs.find((tab) => tab.value === selectedTab)?.label || "Filter"}
        </button>
        {isDropdownOpen && (
          <div className="mt-2 w-full bg-white shadow-lg rounded-md">
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={{
                  pathname: "/dashboard/invoices",
                  query: { ...searchParams, status: tab.value, page: "1" },
                }}
                className={`block px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                  tab.value === selectedTab ? "bg-blue-500 text-white" : ""
                }`}
                onClick={() => setIsDropdownOpen(false)} // Close dropdown after selecting
              >
                {tab.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden sm:flex space-x-4">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={{
              pathname: "/dashboard/invoices",
              query: { ...searchParams, status: tab.value, page: "1" },
            }}
            className={`${
              tab.value === selectedTab
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-600"
            } px-4 py-2 rounded-md cursor-pointer transition-all duration-200`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
