
"use client";

import { useState } from "react";
import { importStockBatch } from "@/features/inventory/import-actions";

const TEST_DATA = [
    {
        "Name": "Normal Header Product",
        "SKU": "TEST-NORMAL",
        "Quantity": 1,
        "Category": "General",
        "Warehouse": "Main Warehouse"
    },
    {
        " name ": "Spaced Header Product",
        "sku": "TEST-SPACED",
        "Quantity": 1,
        "Category": "General",
        "Warehouse": "Main Warehouse"
    },
    {
        "NAME": "Uppercase Header Product",
        " SKU ": "TEST-UPPER",
        "Quantity": 1,
        "Category": "General",
        "Warehouse": "Main Warehouse"
    }
];

export default function TestImportPage() {
    const [status, setStatus] = useState("Idle");
    const [result, setResult] = useState<any>(null);

    const runImport = async () => {
        setStatus("Running...");
        try {
            const res = await importStockBatch(TEST_DATA);
            setResult(res);
            setStatus("Done");
        } catch (e: any) {
            setStatus("Error: " + e.message);
            console.error(e);
        }
    };

    return (
        <div className="p-10">
            <h1>Test Robust Import Logic</h1>
            <button
                onClick={runImport}
                className="bg-blue-500 text-white px-4 py-2 rounded"
                id="run-import-btn"
            >
                Run Import
            </button>
            <div className="mt-4">
                Status: <span id="status">{status}</span>
            </div>
            <pre className="mt-4 p-4 bg-gray-100" id="result">
                {JSON.stringify(result, null, 2)}
            </pre>
        </div>
    );
}
