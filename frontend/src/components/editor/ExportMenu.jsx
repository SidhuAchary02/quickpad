// src/components/ExportMenu.jsx
import { useState } from "react";
import { Download, FileText, File, X } from "lucide-react";
import {
  exportAsTXT,
  exportAsPDFSimple,
  exportAsPDFFormatted,
} from "../../utils/exportUtils";

const ExportMenu = ({ content, noteUrl, isOpen, onClose }) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportType, setExportType] = useState("");

  const handleExport = async (type) => {
    setIsExporting(true);
    setExportType(type);

    const filename = noteUrl || "quickpad-note";

    try {
      switch (type) {
        case "txt":
          exportAsTXT(content, filename);
          break;
        case "pdf-simple":
          exportAsPDFSimple(content, filename);
          break;
        case "pdf-formatted":
          exportAsPDFFormatted("note-content", filename);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setTimeout(() => {
        setIsExporting(false);
        setExportType("");
        onClose();
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1100">
      <div className="bg-white dark:bg-zinc-800 rounded-lg p-6 w-96 max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Export Note
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-zinc-400" />
          </button>
        </div>

        <div className="space-y-3">
          {/* TXT Export */}
          <button
            onClick={() => handleExport("txt")}
            disabled={isExporting}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <FileText className="w-5 h-5 text-blue-500" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                Plain Text (.txt)
              </div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">
                Simple text file, no formatting
              </div>
            </div>
            {isExporting && exportType === "txt" && (
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {/* Simple PDF Export */}
          <button
            onClick={() => handleExport("pdf-simple")}
            disabled={isExporting}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <File className="w-5 h-5 text-red-500" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                PDF - Simple (.pdf)
              </div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">
                Basic PDF with plain text
              </div>
            </div>
            {isExporting && exportType === "pdf-simple" && (
              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button>

          {/* Formatted PDF Export */}
          {/* <button
            onClick={() => handleExport('pdf-formatted')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 p-3 border border-gray-200 dark:border-zinc-600 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
          >
            <File className="w-5 h-5 text-green-500" />
            <div className="flex-1 text-left">
              <div className="font-medium text-gray-900 dark:text-white">
                PDF - Formatted (.pdf)
              </div>
              <div className="text-sm text-gray-500 dark:text-zinc-400">
                PDF with formatting preserved
              </div>
            </div>
            {isExporting && exportType === 'pdf-formatted' && (
              <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
            )}
          </button> */}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-600">
          <p className="text-xs text-gray-500 dark:text-zinc-400 text-center">
            Choose your preferred export format
          </p>
        </div>
      </div>
    </div>
  );
};

export default ExportMenu;
