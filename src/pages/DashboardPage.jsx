import { useSelector } from "react-redux";
import DashboardChart from "../components/DashboardChart";

export default function DashboardPage() {
  const issues = useSelector((s) => s.issue.issues);
  const all = Object.values(issues).flat();

  const data = [
    { name: "To Do", value: all.filter((i) => i.status === "todo").length },
    { name: "In Progress", value: all.filter((i) => i.status === "inprogress").length },
    { name: "Done", value: all.filter((i) => i.status === "done").length },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
      <DashboardChart data={data} />
      <p className="text-gray-600">
        Tổng số issues: <b>{all.length}</b>
      </p>
    </div>
  );
}
