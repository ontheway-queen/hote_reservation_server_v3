"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultChartOfAcc = void 0;
exports.defaultChartOfAcc = [
    {
        group_code: 1000,
        name: "Current Asset",
        code: "1001",
        child: [
            {
                group_code: 1000,
                name: "Cash Accounts",
                config: "CASH_HEAD_ID",
                code: "1001.001",
            },
            {
                group_code: 1000,
                name: "Bank Accounts",
                config: "BANK_HEAD_ID",
                code: "1001.002",
            },
            {
                group_code: 1000,
                name: "MFS",
                config: "MFS_HEAD_ID",
                code: "1001.003",
            },
            {
                group_code: 1000,
                name: "Accounts Receivable",
                config: "RECEIVABLE_HEAD_ID",
                code: "1001.004",
            },
        ],
    },
    {
        group_code: 1000,
        name: "Fixed Assets",
        config: "FIXED_ASSET_HEAD_ID",
        code: "1002",
    },
    {
        group_code: 2000,
        name: "Current Liabilities",
        code: "2001",
        child: [
            {
                group_code: 2000,
                name: "Accounts Payable",
                config: "ACCOUNT_PAYABLE_HEAD_ID",
                code: "2001.001",
            },
            {
                group_code: 2000,
                name: "Advance Payments",
                config: "ADVANCE_PAYMENT_HEAD_ID",
                code: "2001.002",
            },
        ],
    },
    {
        group_code: 2000,
        name: "Long-term Liabilities",
        code: "2002",
    },
    {
        group_code: 3000,
        name: "Owner’s Equity",
        code: "3001",
        child: [
            {
                group_code: 3000,
                name: "Owner’s Capital",
                config: "OWNERS_CAPITAL_HEAD_ID",
                code: "3001.001",
            },
        ],
    },
    {
        group_code: 4000,
        name: "Revenue/Income",
        code: "4001",
        child: [
            {
                group_code: 4000,
                name: "Hotel/Resort Revenue",
                config: "HOTEL_REVENUE_HEAD_ID",
                code: "4001.001",
            },
            {
                group_code: 4000,
                name: "Restaurant Sales – Food",
                config: "RESTAURANT_REVENUE_HEAD_ID",
                code: "4001.002",
            },
        ],
    },
    {
        group_code: 5000,
        name: "Operating Expenses",
        code: "5001",
        child: [
            {
                group_code: 5000,
                name: "Salaries and Wages",
                config: "PAYROLL_HEAD_ID",
                code: "5001.001",
            },
            {
                group_code: 5000,
                name: "Restaurant Expenses",
                config: "RESTAURANT_EXPENSE_HEAD_ID",
                code: "5001.002",
            },
            {
                group_code: 5000,
                name: "Hotel Expenses",
                config: "HOTEL_EXPENSE_HEAD_ID",
                code: "5001.003",
            },
        ],
    },
];
//# sourceMappingURL=chartOfAcc.js.map