import { useEffect, useState } from "react";

const PAGE_SIZE = 8;

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: "", skills: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const controller = new AbortController();

    const loadUsers = async () => {
      setFetching(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: PAGE_SIZE.toString(),
        });

        const trimmedSearch = searchQuery.trim();
        if (trimmedSearch) {
          params.append("search", trimmedSearch);
        }

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/auth/users?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            signal: controller.signal,
          }
        );

        const data = await res.json();
        if (res.ok) {
          setUsers(data.users || []);
          setTotalPages(data.totalPages || 1);
          setTotalUsers(data.total || 0);
          if (typeof data.page === "number" && data.page !== page) {
            setPage(data.page);
          }
        } else {
          console.error(data.error || "Failed to fetch users");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching users", err);
        }
      } finally {
        setFetching(false);
      }
    };

    loadUsers();

    return () => controller.abort();
  }, [token, page, searchQuery, reloadKey]);

  const handleEditClick = (user) => {
    setEditingUser(user.email);
    setFormData({
      role: user.role,
      skills: user.skills?.join(", ") || "",
    });
  };

  const handleUpdate = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/api/auth/update-user`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: editingUser,
            role: formData.role,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        console.error(data.error || "Failed to update user");
        return;
      }

      setEditingUser(null);
      setFormData({ role: "", skills: "" });
      setReloadKey((key) => key + 1);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
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

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6">Admin Panel - Manage Users</h1>
      <input
        type="text"
        className="input input-bordered w-full mb-6"
        placeholder="Search by email"
        value={searchQuery}
        onChange={handleSearch}
      />

      {fetching && <p className="text-sm text-base-content/70 mb-4">Loading users...</p>}
      {!fetching && users.length === 0 && (
        <p className="text-sm text-base-content/70 mb-4">No users found.</p>
      )}

      {users.map((user) => (
        <div
          key={user._id}
          className="bg-base-100 shadow rounded p-4 mb-4 border"
        >
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Current Role:</strong> {user.role}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {user.skills && user.skills.length > 0
              ? user.skills.join(", ")
              : "N/A"}
          </p>

          {editingUser === user.email ? (
            <div className="mt-4 space-y-2">
              <select
                className="select select-bordered w-full"
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
              >
                <option value="user">User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>

              <input
                type="text"
                placeholder="Comma-separated skills"
                className="input input-bordered w-full"
                value={formData.skills}
                onChange={(e) =>
                  setFormData({ ...formData, skills: e.target.value })
                }
              />

              <div className="flex gap-2">
                <button
                  className="btn btn-success btn-sm"
                  onClick={handleUpdate}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setEditingUser(null)}
                  disabled={saving}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              className="btn btn-primary btn-sm mt-2"
              onClick={() => handleEditClick(user)}
            >
              Edit
            </button>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between mt-6">
        <span className="text-sm text-base-content/70">
          Showing page {page} of {totalPages} ({totalUsers} total)
        </span>
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
