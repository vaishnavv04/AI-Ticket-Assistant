import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const PAGE_SIZE = 6;

export default function Tickets() {
  const [form, setForm] = useState({ title: "", description: "" });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState({ status: "all", search: "" });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTickets, setTotalTickets] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  let parsedUser = null;
  if (storedUser) {
    try {
      parsedUser = JSON.parse(storedUser);
    } catch (error) {
      console.warn("Failed to parse stored user", error);
    }
  }
  const user = parsedUser;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const loadTickets = async () => {
      setFetching(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
        });

        if (filter.status !== "all") {
          params.append("status", filter.status);
        }

        const searchTerm = filter.search.trim();
        if (searchTerm) {
          params.append("search", searchTerm);
        }

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/tickets?${params.toString()}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            method: "GET",
            signal: controller.signal,
          }
        );

        const data = await res.json();

        if (res.ok) {
          setTickets(data.tickets || []);
          setTotalPages(data.totalPages || 1);
          setTotalTickets(data.total || 0);
          if (typeof data.page === "number" && data.page !== page) {
            setPage(data.page);
          }
          setSelectedIds([]);
        } else {
          console.error(data.error || data.message || "Failed to fetch tickets");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Failed to fetch tickets:", err);
        }
      } finally {
        setFetching(false);
      }
    };

    loadTickets();

    return () => controller.abort();
  }, [page, filter.status, filter.search, reloadKey, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setForm({ title: "", description: "" });
        setPage(1);
        setReloadKey((key) => key + 1);
      } else {
        alert(data.message || data.error || "Ticket creation failed");
      }
    } catch (err) {
      alert("Error creating ticket");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilter = (value) => {
    setFilter((prev) => ({ ...prev, status: value }));
    setPage(1);
  };

  const handleSearchFilter = (value) => {
    setFilter((prev) => ({ ...prev, search: value }));
    setPage(1);
  };

  const goToPrevious = () => {
    setPage((prev) => Math.max(prev - 1, 1));
  };

  const goToNext = () => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  };

  const disablePrev = page <= 1 || fetching;
  const disableNext = page >= totalPages || fetching;
  const hasSelection = selectedIds.length > 0;
  const allSelectedOnPage = tickets.length > 0 && selectedIds.length === tickets.length;

  const toggleSelection = (ticketId) => {
    setSelectedIds((prev) =>
      prev.includes(ticketId)
        ? prev.filter((id) => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const toggleSelectAllOnPage = () => {
    if (tickets.length === 0) return;
    setSelectedIds((prev) => (prev.length === tickets.length ? [] : tickets.map((t) => t._id)));
  };

  const clearSelection = () => setSelectedIds([]);

  const handleBulkDelete = async () => {
    if (!hasSelection) return;
    const confirmed = window.confirm(
      `Delete ${selectedIds.length} ticket${selectedIds.length === 1 ? "" : "s"}? This cannot be undone.`
    );
    if (!confirmed) return;

    setBulkLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ids: selectedIds }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Tickets deleted");
        setSelectedIds([]);
        setPage(1);
        setReloadKey((key) => key + 1);
      } else {
        alert(data.message || data.error || "Bulk delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting tickets");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Create Ticket</h2>

      <form onSubmit={handleSubmit} className="space-y-3 mb-8">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Ticket Title"
          className="input input-bordered w-full"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Ticket Description"
          className="textarea textarea-bordered w-full"
          required
        ></textarea>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit Ticket"}
        </button>
      </form>

      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold">All Tickets</h2>
        <span className="text-sm text-base-content/70">
          Showing page {page} of {totalPages} ({totalTickets} total)
        </span>
      </div>
      <div className="flex items-center gap-2 mb-3">
        <select
          className="select select-bordered"
          value={filter.status}
          onChange={(e) => handleStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <input
          className="input input-bordered flex-1"
          placeholder="Search title or description"
          value={filter.search}
          onChange={(e) => handleSearchFilter(e.target.value)}
        />
      </div>
      {isAdmin && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            className="btn btn-sm"
            onClick={toggleSelectAllOnPage}
            disabled={tickets.length === 0 || fetching}
          >
            {allSelectedOnPage ? "Deselect all" : "Select all"}
          </button>
          <button
            className="btn btn-sm"
            onClick={clearSelection}
            disabled={!hasSelection}
          >
            Clear selection
          </button>
          <button
            className="btn btn-sm btn-error"
            onClick={handleBulkDelete}
            disabled={!hasSelection || bulkLoading}
          >
            {bulkLoading ? "Deleting..." : `Delete selected (${selectedIds.length})`}
          </button>
        </div>
      )}
      <div className="space-y-3">
        {fetching && <p className="text-sm text-base-content/70">Loading tickets...</p>}
        {!fetching && tickets.length === 0 && <p>No tickets found.</p>}
        {tickets.map((ticket) => {
          const selected = selectedIds.includes(ticket._id);
          return (
            <div
              key={ticket._id}
              className={`card shadow-md p-4 bg-gray-800 border ${
                selected ? "border-primary" : "border-transparent"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {isAdmin && (
                    <input
                      type="checkbox"
                      className="checkbox mt-1"
                      checked={selected}
                      onChange={() => toggleSelection(ticket._id)}
                    />
                  )}
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{ticket.title}</h3>
                    <p className="text-sm opacity-80">{ticket.description}</p>
                    {ticket.status && (
                      <div className="mt-1">
                        <span
                          className={`badge ${
                            ticket.status === "DONE"
                              ? "badge-success"
                              : ticket.status === "IN_PROGRESS"
                              ? "badge-warning"
                              : "badge-neutral"
                          }`}
                        >
                          {ticket.status}
                        </span>
                      </div>
                    )}
                    {ticket.createdAt && (
                      <p className="text-sm text-gray-500">
                        Created At: {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
                <div className="sm:self-center">
                  <Link to={`/tickets/${ticket._id}`} className="btn btn-sm btn-outline">
                    View details
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mt-4">
        <div></div>
        <div className="join">
          <button
            className="btn btn-sm join-item"
            onClick={goToPrevious}
            disabled={disablePrev}
          >
            Previous
          </button>
          <span className="btn btn-sm join-item pointer-events-none">
            Page {page} / {totalPages}
          </span>
          <button
            className="btn btn-sm join-item"
            onClick={goToNext}
            disabled={disableNext}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
