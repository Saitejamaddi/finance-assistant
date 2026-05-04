const SHEET_NAME = "Finances";
const CLIENT_ID =
  "765973493362-d0dm0fvs37m39japksdk2nurqth4i0ls.apps.googleusercontent.com";
const SCOPES =
  "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

// ── Tab names inside the sheet ──────────────────────────────────────────
const TABS = {
  TRANSACTIONS: "Transactions",
  BUDGETS: "Budgets",
  GOALS: "Goals",
  CATEGORIES: "Categories",
  SETTINGS: "Settings",
  ACCOUNTS: "Accounts",
};

// ── Load gapi and initialize ────────────────────────────────────────────
export const loadGapi = () => {
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.gapi) {
        clearInterval(check);
        window.gapi.load("client", async () => {
          await window.gapi.client.init({
            discoveryDocs: [
              "https://sheets.googleapis.com/$discovery/rest?version=v4",
              "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
            ],
          });
          resolve();
        });
      }
    }, 100);
  });
};

// ── Sign in with Google ─────────────────────────────────────────────────
export const signInWithGoogle = () => {
  return new Promise((resolve, reject) => {
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (response) => {
        if (response.error) {
          reject(response.error);
          return;
        }
        resolve(response.access_token);
      },
    });
    client.requestAccessToken();
  });
};

// ── Find or create the "Finances" spreadsheet ───────────────────────────
export const findOrCreateSheet = async () => {
  const res = await window.gapi.client.drive.files.list({
    q: `name='${SHEET_NAME}' and mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
    fields: "files(id, name)",
  });

  if (res.result.files.length > 0) {
    return res.result.files[0].id;
  }

  const createRes = await window.gapi.client.sheets.spreadsheets.create({
    properties: { title: SHEET_NAME },
    sheets: Object.values(TABS).map((title) => ({ properties: { title } })),
  });

  const spreadsheetId = createRes.result.spreadsheetId;
  await addHeaders(spreadsheetId);
  return spreadsheetId;
};

// ── Add headers to all tabs ─────────────────────────────────────────────
const addHeaders = async (spreadsheetId) => {
  const data = [
    {
      range: `${TABS.TRANSACTIONS}!A1`,
      values: [
        [
          "ID",
          "Title",
          "Type",
          "Amount",
          "Category",
          "Date",
          "Notes",
          "IsRecurring",
          "Frequency",
          "AccountId",
        ],
      ],
    },
    {
      range: `${TABS.BUDGETS}!A1`,
      values: [["Category", "Amount"]],
    },
    {
      range: `${TABS.GOALS}!A1`,
      values: [["ID", "Name", "Target", "Saved"]],
    },
    {
      range: `${TABS.CATEGORIES}!A1`,
      values: [["Name"]],
    },
    {
      range: `${TABS.SETTINGS}!A1`,
      values: [["Key", "Value"]],
    },
    {
      range: `${TABS.ACCOUNTS}!A1`,
      values: [
        [
          "ID",
          "Name",
          "Icon",
          "Color",
          "OpeningBalance",
          "AccountType",
          "CreditLimit",
        ],
      ],
    },
  ];

  await window.gapi.client.sheets.spreadsheets.values.batchUpdate({
    spreadsheetId,
    resource: { valueInputOption: "RAW", data },
  });
};

// ── Generic read all rows from a tab ───────────────────────────────────
const readTab = async (spreadsheetId, tab) => {
  const res = await window.gapi.client.sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${tab}!A2:Z`,
  });
  return res.result.values || [];
};

// ── TRANSACTIONS ────────────────────────────────────────────────────────
export const readTransactions = async (spreadsheetId) => {
  const rows = await readTab(spreadsheetId, TABS.TRANSACTIONS);
  return rows.map((r) => ({
    id: parseInt(r[0]) || Date.now(),
    title: r[1] || "",
    type: r[2] || "debit",
    amount: parseFloat(r[3]) || 0,
    category: r[4] || "Other",
    date: r[5] || "",
    notes: r[6] || "",
    isRecurring: r[7] === "true",
    recurringFrequency: r[8] || "monthly",
    accountId: r[9] ? Number(r[9]) : null,
  }));
};

export const writeAllTransactions = async (spreadsheetId, transactions) => {
  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${TABS.TRANSACTIONS}!A2:Z`,
  });

  if (transactions.length === 0) return;

  const values = transactions.map((t) => [
    t.id,
    t.title,
    t.type,
    t.amount,
    t.category,
    t.date,
    t.notes || "",
    t.isRecurring,
    t.recurringFrequency,
    t.accountId ?? "",
  ]);

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TABS.TRANSACTIONS}!A2`,
    valueInputOption: "RAW",
    resource: { values },
  });
};

// ── BUDGETS ─────────────────────────────────────────────────────────────
export const readBudgets = async (spreadsheetId) => {
  const rows = await readTab(spreadsheetId, TABS.BUDGETS);
  const budgets = {};
  rows.forEach((r) => {
    if (r[0]) budgets[r[0]] = parseFloat(r[1]) || 0;
  });
  return budgets;
};

export const writeAllBudgets = async (spreadsheetId, budgets) => {
  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${TABS.BUDGETS}!A2:Z`,
  });

  const entries = Object.entries(budgets);
  if (entries.length === 0) return;

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TABS.BUDGETS}!A2`,
    valueInputOption: "RAW",
    resource: { values: entries.map(([cat, amt]) => [cat, amt]) },
  });
};

// ── GOALS ───────────────────────────────────────────────────────────────
export const readGoals = async (spreadsheetId) => {
  const rows = await readTab(spreadsheetId, TABS.GOALS);
  return rows.map((r) => ({
    id: parseInt(r[0]) || Date.now(),
    name: r[1] || "",
    target: parseFloat(r[2]) || 0,
    saved: parseFloat(r[3]) || 0,
  }));
};

export const writeAllGoals = async (spreadsheetId, goals) => {
  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${TABS.GOALS}!A2:Z`,
  });

  if (goals.length === 0) return;

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TABS.GOALS}!A2`,
    valueInputOption: "RAW",
    resource: { values: goals.map((g) => [g.id, g.name, g.target, g.saved]) },
  });
};

// ── CATEGORIES ──────────────────────────────────────────────────────────
export const readCategories = async (spreadsheetId) => {
  const rows = await readTab(spreadsheetId, TABS.CATEGORIES);
  return rows.map((r) => r[0]).filter(Boolean);
};

export const writeAllCategories = async (spreadsheetId, categories) => {
  await window.gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: `${TABS.CATEGORIES}!A2:Z`,
  });

  if (categories.length === 0) return;

  await window.gapi.client.sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${TABS.CATEGORIES}!A2`,
    valueInputOption: "RAW",
    resource: { values: categories.map((c) => [c]) },
  });
};

// ── SETTINGS ────────────────────────────────────────────────────────────
export const readSettings = async (spreadsheetId) => {
  const rows = await readTab(spreadsheetId, TABS.SETTINGS);
  const settings = {};
  rows.forEach((r) => {
    if (r[0]) settings[r[0]] = r[1];
  });
  return settings;
};

export const writeSetting = async (spreadsheetId, key, value) => {
  const rows = await readTab(spreadsheetId, TABS.SETTINGS);
  const existingIndex = rows.findIndex((r) => r[0] === key);

  if (existingIndex >= 0) {
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TABS.SETTINGS}!A${existingIndex + 2}`,
      valueInputOption: "RAW",
      resource: { values: [[key, value]] },
    });
  } else {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${TABS.SETTINGS}!A2`,
      valueInputOption: "RAW",
      resource: { values: [[key, value]] },
    });
  }
};

// ── ACCOUNTS ────────────────────────────────────────────────────────────
const ensureAccountsTab = async (spreadsheetId) => {
  // Check if Accounts tab exists
  const meta = await window.gapi.client.sheets.spreadsheets.get({
    spreadsheetId,
  });
  const sheets = meta.result.sheets || [];
  const exists = sheets.some((s) => s.properties.title === TABS.ACCOUNTS);

  if (!exists) {
    // Create the tab
    await window.gapi.client.sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      resource: {
        requests: [{ addSheet: { properties: { title: TABS.ACCOUNTS } } }],
      },
    });
    // Add header row
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TABS.ACCOUNTS}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [
          [
            "ID",
            "Name",
            "Icon",
            "Color",
            "OpeningBalance",
            "AccountType",
            "CreditLimit",
          ],
        ],
      },
    });
  }
};

export const readAccounts = async (spreadsheetId) => {
  try {
    await ensureAccountsTab(spreadsheetId);
    const rows = await readTab(spreadsheetId, TABS.ACCOUNTS);
    return rows.map(
      ([id, name, icon, color, openingBalance, accountType, creditLimit]) => ({
        id: Number(id),
        name: name || "",
        icon: icon || "🏦",
        color: color || "#6b7280",
        openingBalance:
          openingBalance !== undefined && openingBalance !== ""
            ? parseFloat(openingBalance)
            : "",
        accountType: accountType || "bank",
        creditLimit:
          creditLimit !== undefined && creditLimit !== ""
            ? parseFloat(creditLimit)
            : "",
      }),
    );
  } catch (err) {
    console.warn("readAccounts error:", err);
    return [];
  }
};

export const writeAllAccounts = async (spreadsheetId, accounts) => {
  try {
    await ensureAccountsTab(spreadsheetId);
    await window.gapi.client.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${TABS.ACCOUNTS}!A2:Z`,
    });
    if (accounts.length === 0) return;
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${TABS.ACCOUNTS}!A2`,
      valueInputOption: "RAW",
      resource: {
        values: accounts.map((a) => [
          a.id,
          a.name,
          a.icon,
          a.color,
          a.openingBalance ?? "",
          a.accountType || "bank",
          a.creditLimit ?? "",
        ]),
      },
    });
  } catch (err) {
    console.error("writeAllAccounts error:", err);
  }
};
