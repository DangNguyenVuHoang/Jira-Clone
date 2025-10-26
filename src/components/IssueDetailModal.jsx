import { useSelector, useDispatch } from "react-redux";
import { useState } from "react";
import Button from "./ui/Button";
import { addComment } from "../app/commentSlice";

export default function IssueDetailModal({ issue, onClose }) {
  const dispatch = useDispatch();
  const comments = useSelector((s) => s.comment.comments[issue.id] || []);
  const [text, setText] = useState("");
  const user = localStorage.getItem("jira_user") || "Unknown";

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text.trim()) {
      dispatch(addComment(issue.id, text, user));
      setText("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 w-[500px] shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">{issue.title}</h2>
        <p className="text-gray-600 mb-2">{issue.desc}</p>
        <p className="text-sm text-gray-400 mb-4">
          Status: <span className="capitalize font-medium">{issue.status}</span>
        </p>

        <div className="mb-5">
          <h3 className="font-semibold mb-2">Comments</h3>
          <div className="space-y-2">
            {comments.map((c) => (
              <div key={c.id} className="bg-gray-50 p-2 rounded">
                <p className="text-sm text-gray-800">{c.text}</p>
                <p className="text-xs text-gray-500">
                  {c.author} • {new Date(c.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border rounded-lg p-2 h-20 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Add a comment..."
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Close
            </Button>
            <Button type="submit">Add</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
