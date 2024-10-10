"use client";

import {
  CheckIcon,
  ClockIcon,
  TrashIcon,
  XCircleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { useRef, useState } from "react";
import Dropdown from "./dropdown";
import { addAuditLog, updateInvoiceStatus } from "@/app/lib/actions";
import { useOnClickOutside } from "@/app/hooks/useOnClickOutside";

const statusOptions = [
  { item: "Pending", index: "pending" },
  { item: "Paid", index: "paid" },
  { item: "Canceled", index: "canceled" },
];

export default function InvoiceStatus({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const [dropdownOpen, setdropDownOpen] = useState(false);
  const dropDownRef = useRef(null);
  const handleDropdownToggle = () => setdropDownOpen((prev) => !prev);
  const filteredStatusOptions = statusOptions.filter((option) => {
    if (
      (status === "pending" || status === "overdue") &&
      option.index === "pending"
    ) {
      return false;
    }
    return option.index !== status;
  });
  const handleStatusChange = async (newStatus: string) => {
    await updateInvoiceStatus(id, newStatus);
    await addAuditLog(id, newStatus, status, "change");
    setdropDownOpen(false);
  };
  useOnClickOutside(dropDownRef, () => setdropDownOpen(false));
  return (
    <div className="">
      <button
        onClick={handleDropdownToggle}
        className={clsx(
          "inline-flex items-center w-32 rounded-full px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500",
          {
            "bg-gray-100 text-gray-500": status === "pending",
            "bg-gray-200 text-gray-500": status === "overdue",
            "bg-green-500 text-white": status === "paid",
            "bg-red-500 text-white": status === "canceled",
          }
        )}
      >
        {status === "pending" && (
          <>
            Pending
            <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
        )}
        {status === "paid" && (
          <>
            Paid
            <CheckIcon className="ml-1 w-4 text-white" />
          </>
        )}
        {status === "canceled" && (
          <>
            Canceled
            <XCircleIcon className="ml-1 w-4 text-white" />
          </>
        )}
        {status === "overdue" && (
          <>
            Overdue
            <ClockIcon className="ml-1 w-4 text-gray-500" />
          </>
        )}
        <ChevronDownIcon className="w-4 ml-auto" />
        {""}
      </button>

      {dropdownOpen && (
        <div
          ref={dropDownRef}
          className="absolute mt-2 w-32 text-xs rounded-md bg-white shadow-lg border border-gray-300 z-10"
        >
          <Dropdown
            options={filteredStatusOptions}
            onSelect={handleStatusChange}
          />
        </div>
      )}
    </div>
  );
}
