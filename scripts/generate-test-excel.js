
const XLSX = require('xlsx');

const data = [
    {
        "Name": "Browser Test Product 1",
        "SKU": "BROWSER-TEST-001",
        "Category": "Electronics",
        "Warehouse": "Main Warehouse",
        "Quantity": 50,
        "Unit": "pcs",
        "Cost Price": 50000,
        "Selling Price": 75000,
        "Min Stock": 5
    },
    {
        "Name": "Browser Test Product 2",
        "SKU": "BROWSER-TEST-002",
        "Category": "Food",
        "Warehouse": "Main Warehouse",
        "Quantity": 100,
        "Unit": "kg",
        "Cost Price": 10000,
        "Selling Price": 15000,
        "Min Stock": 20
    }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(data);
XLSX.utils.book_append_sheet(wb, ws, "Template");
XLSX.writeFile(wb, 'test_inventory_import.xlsx');
console.log('Created test_inventory_import.xlsx');
