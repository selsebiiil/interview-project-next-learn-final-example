// components/Tabs.tsx
"use client";

import { addAuditLog, updateInvoiceStatus } from "@/app/lib/actions";
import { AuditLog } from "@/app/lib/definitions";

interface AuditLogsListProps {
  auditLogs: any;
  invoiceId: string;
}

export default function AuditLogsList({
  auditLogs,
  invoiceId,
}: AuditLogsListProps) {
  const handleRestore = async (log: AuditLog) => {
    try {
      await updateInvoiceStatus(invoiceId, log.previous_status);
      await addAuditLog(
        invoiceId,
        log.previous_status,
        log.new_status,
        "restore"
      );
    } catch (error) {
      alert("Failed to restore invoice");
    }
  };
  return (
    <section>
      <h2 className="text-xl font-semibold text-gray-800">
        Invoice Activity Logs
      </h2>
      {auditLogs.length > 0 ? (
        <div className="space-y-4">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="border p-4 rounded shadow-sm bg-gray-50"
            >
              <p>
                <strong>{log.changed_by_name}</strong>
                {log.action_type === "change"
                  ? ` changed the invoice from ${log.previous_status} to ${log.new_status}`
                  : ` restored the invoice to ${log.new_status}`}
              </p>
              <p className="text-sm text-gray-500">
                <em>{new Date(log.changed_at).toLocaleString()}</em>
              </p>
              {log.action_type === "change" && (
                <button
                  className="text-blue-500 hover:underline mt-2"
                  onClick={() => handleRestore(log)}
                >
                  Restore to this state
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          No activity logs found for this invoice.
        </p>
      )}
    </section>
  );
}
