const BASE =
  import.meta.env.VITE_API_BASE || "https://companies-api-development-86vm.onrender.com";

/**
 * Fetch companies from backend with optional filters
 * @param {Object} params - Query parameters (search, industry, location, sizeMin, sizeMax, etc.)
 */
export async function fetchCompanies(params = {}) {
  const url = new URL(`${BASE}/companies`);

  // ✅ Add query params safely
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      url.searchParams.append(key, value);
    }
  });

  try {
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      throw new Error(`Error ${res.status}: ${res.statusText}`);
    }

    return await res.json(); // { success, data, meta }
  } catch (err) {
    console.error("❌ Error fetching companies:", err.message);
    throw err;
  }
}
