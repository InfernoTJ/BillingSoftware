import React from "react";
import { X } from "lucide-react";

const shortcuts = [
  { keys: "Ctrl + D", action: "Go to Dashboard" },
  { keys: "Ctrl + I", action: "Open Inventory" },
  { keys: "Ctrl + P", action: "Open Purchase" },
  { keys: "Ctrl + B", action: "Open Billing" },
  { keys: "Ctrl + S", action: "View Sales History" },
  { keys: "Ctrl + L", action: "Open Ledger" },
  { keys: "Ctrl + E", action: "Export Data" },
  { keys: "Ctrl + Shift + B", action: "Backup Database" }, 
  { keys: "Ctrl + Shift + A", action: "Open Admin Panel" },
  { keys: "Ctrl + Shift + O", action: "Purchase Order" },
  { keys: "Ctrl + Shift + X", action: "Analytics" },
  { keys: "Ctrl + /", action: "Show Shortcut Help" },
];
 
const ShortcutHelp = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          {shortcuts.map((sc, index) => (
            <div
              key={index}
              className="flex justify-between border-b pb-2 text-sm text-gray-700"
            >
              <span className="font-mono text-gray-900">{sc.keys}</span>
              <span>{sc.action}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShortcutHelp;
