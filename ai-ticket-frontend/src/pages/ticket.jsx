import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [edit, setEdit] = useState({ status: "", priority: "", helpfulNotes: "" });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        if (res.ok) {
          setTicket(data.ticket);
          setEdit({
            status: data.ticket.status || "",
            priority: data.ticket.priority || "",
            helpfulNotes: data.ticket.helpfulNotes || "",
          });
        } else {
          alert(data.message || "Failed to fetch ticket");
        }
      } catch (err) {
        console.error(err);
        alert("Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id]);

  if (loading)
    return <div className="text-center mt-10">Loading ticket details...</div>;
  if (!ticket) return <div className="text-center mt-10">Ticket not found</div>;

  const canEdit = user && ["admin", "moderator"].includes(user.role);
  const canDelete = user?.role === "admin";

  const saveChanges = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(edit),
      });
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
      } else {
        alert(data.message || "Update failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error updating ticket");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!canDelete) return;
    const confirmed = window.confirm("Delete this ticket? This action cannot be undone.");
    if (!confirmed) return;

    setDeleting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/tickets/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert(data?.message || "Ticket deleted");
        navigate("/");
      } else {
        alert(data?.error || data?.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      alert("Error deleting ticket");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Ticket Details</h2>

      <div className="card bg-gray-800 shadow p-4 space-y-4">
        <h3 className="text-xl font-semibold">{ticket.title}</h3>
        <p>{ticket.description}</p>

        {/* Conditionally render extended details */}
        {ticket.status && (
          <>
            <div className="divider">Metadata</div>
            <p>
              <strong>Status:</strong> {ticket.status}
            </p>
            {ticket.priority && (
              <p>
                <strong>Priority:</strong> {ticket.priority}
              </p>
            )}

            {ticket.relatedSkills?.length > 0 && (
              <p>
                <strong>Related Skills:</strong>{" "}
                {ticket.relatedSkills.join(", ")}
              </p>
            )}

            {ticket.helpfulNotes && (
              <div>
                <strong>Helpful Notes:</strong>
                <div className="prose max-w-none rounded mt-2">
                  <ReactMarkdown>{ticket.helpfulNotes}</ReactMarkdown>
                </div>
              </div>
            )}

            {ticket.assignedTo && (
              <p>
                <strong>Assigned To:</strong> {ticket.assignedTo?.email}
              </p>
            )}

            {ticket.createdAt && (
              <p className="text-sm text-gray-500 mt-2">
                Created At: {new Date(ticket.createdAt).toLocaleString()}
              </p>
            )}

            {(canEdit || canDelete) && (
              <div className="mt-6 space-y-2 border-t pt-4">
                {canEdit && (
                  <>
                    <h4 className="font-semibold">Moderator Controls</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <select
                        className="select select-bordered"
                        value={edit.status}
                        onChange={(e) => setEdit({ ...edit, status: e.target.value })}
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                      <select
                        className="select select-bordered"
                        value={edit.priority}
                        onChange={(e) => setEdit({ ...edit, priority: e.target.value })}
                      >
                        <option value="low">low</option>
                        <option value="medium">medium</option>
                        <option value="high">high</option>
                      </select>
                    </div>
                    <textarea
                      className="textarea textarea-bordered w-full"
                      placeholder="Helpful notes"
                      rows={6}
                      value={edit.helpfulNotes}
                      onChange={(e) => setEdit({ ...edit, helpfulNotes: e.target.value })}
                    />
                  </>
                )}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  {canEdit && (
                    <button
                      className="btn btn-primary sm:flex-1 md:flex-none"
                      onClick={saveChanges}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  )}
                  {canDelete && (
                    <button
                      className="btn btn-error sm:flex-1 md:flex-none"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      {deleting ? "Deleting..." : "Delete Ticket"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
