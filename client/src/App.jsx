import React, { useEffect, useState } from "react";
import { fetchCompanies } from "./api.js";
import "./App.css";

/* -----------------------
   Reusable Form Controls
------------------------ */
const Input = (props) => <input {...props} className="input" />;

const Select = ({ children, ...props }) => (
  <select {...props} className="input">
    {children}
  </select>
);

const Button = ({ children, variant = "default", ...props }) => {
  const className = `btn ${variant}`;
  return (
    <button {...props} className={className}>
      {children}
    </button>
  );
};

/* -----------------------
   Main App Component
------------------------ */
export default function App() {
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [sizeMin, setSizeMin] = useState("");
  const [sizeMax, setSizeMax] = useState("");
  const [foundedFrom, setFoundedFrom] = useState("");
  const [foundedTo, setFoundedTo] = useState("");

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    data: [],
    meta: { page: 1, pages: 1, total: 0 },
  });
  const [error, setError] = useState("");

  /* Fetch companies */
  const load = async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const res = await fetchCompanies({
        search,
        industry,
        location,
        sizeMin,
        sizeMax,
        foundedFrom,
        foundedTo,
        page,
        limit: 10,
      });

      setData(res);
    } catch (e) {
      setError(e.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Form Submit */
  const onSubmit = (e) => {
    e.preventDefault();
    load(1);
  };

  /* Reset Filters */
  const resetFilters = () => {
    setSearch("");
    setIndustry("");
    setLocation("");
    setSizeMin("");
    setSizeMax("");
    setFoundedFrom("");
    setFoundedTo("");
    load(1);
  };

  const { data: rows, meta } = data;

  return (
    <div className="container">
      <h1>Companies</h1>

      {/* 🔍 Search + Filters */}
      <form onSubmit={onSubmit} className="card filters">
        <Input
          placeholder="Search (name, description, tags...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Select value={industry} onChange={(e) => setIndustry(e.target.value)}>
          <option value="">All Industries</option>
          <option value="Software">Software</option>
          <option value="Finance">Finance</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Education">Education</option>
          <option value="Manufacturing">Manufacturing</option>
        </Select>

        <Input
          placeholder="Location (e.g. Bengaluru)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />

        <div className="range-row">
          <Input
            type="number"
            placeholder="Size Min"
            value={sizeMin}
            onChange={(e) => setSizeMin(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Size Max"
            value={sizeMax}
            onChange={(e) => setSizeMax(e.target.value)}
          />
        </div>

        <div className="range-row">
          <Input
            type="number"
            placeholder="Founded From"
            value={foundedFrom}
            onChange={(e) => setFoundedFrom(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Founded To"
            value={foundedTo}
            onChange={(e) => setFoundedTo(e.target.value)}
          />
        </div>

        <div className="btn-row">
          <Button type="submit" variant="apply">
            Apply Filters
          </Button>
          <Button type="button" variant="reset" onClick={resetFilters}>
            Reset
          </Button>
        </div>
      </form>

      {error && <div className="error">Error: {error}</div>}

      {/* Companies Table */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              {[
                "Name",
                "Industry",
                "Location",
                "Size",
                "Founded",
                "Website",
                "Description",
                "Tags",
              ].map((h) => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="loading">
                  Loading…
                </td>
              </tr>
            ) : rows?.length ? (
              rows.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td>{c.industry}</td>
                  <td>{c.location}</td>
                  <td>{c.size ?? "-"}</td>
                  <td>{c.foundedYear ?? "-"}</td>
                  <td>
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noreferrer">
                        Visit
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{c.description ?? "-"}</td>
                  <td>
                    {c.tags && c.tags.length > 0 ? (
                      <div className="tags">
                        {c.tags.map((tag, i) => (
                          <span key={i} className="tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="loading">
                  No results
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <Button
          onClick={() => load(Math.max(1, meta.page - 1))}
          disabled={meta.page <= 1}
        >
          Prev
        </Button>
        <span>
          Page {meta.page} / {meta.pages} (Total: {meta.total})
        </span>
        <Button
          onClick={() => load(Math.min(meta.pages, meta.page + 1))}
          disabled={meta.page >= meta.pages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
