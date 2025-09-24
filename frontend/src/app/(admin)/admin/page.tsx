import { Badge } from "@/components/admin/Badge";
import { Card } from "@/components/admin/Card";
import { Table, type TableColumn } from "@/components/admin/Table";

const metrics = [
  { label: "Active Channels", value: 128, delta: "+12% vs last week" },
  { label: "Monthly Publications", value: 432, delta: "+8% vs last month" },
  { label: "Pending Reviews", value: 18, delta: "-5% vs last cycle" },
];

type RecentChannel = {
  id: string;
  name: string;
  owner: string;
  status: "Active" | "Draft" | "Paused";
  updatedAt: string;
};

const recentChannels: RecentChannel[] = [
  {
    id: "chn-1021",
    name: "Education Weekly",
    owner: "Alice Johnson",
    status: "Active",
    updatedAt: "2025-09-19",
  },
  {
    id: "chn-1019",
    name: "Comedy Central Station",
    owner: "Marcus Reed",
    status: "Paused",
    updatedAt: "2025-09-18",
  },
  {
    id: "chn-1012",
    name: "Tech Insights Daily",
    owner: "Priya Patel",
    status: "Active",
    updatedAt: "2025-09-18",
  },
];

const columns: Array<TableColumn<RecentChannel>> = [
  {
    id: "name",
    header: "Channel",
    render: (item) => (
      <div className="space-y-1">
        <p className="font-semibold text-slate-900">{item.name}</p>
        <p className="text-xs text-slate-500">#{item.id}</p>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    render: (item) => <span className="text-sm text-slate-700">{item.owner}</span>,
  },
  {
    id: "status",
    header: "Status",
    render: (item) => (
      <Badge tone={item.status === "Active" ? "success" : item.status === "Draft" ? "warning" : "danger"}>
        {item.status}
      </Badge>
    ),
  },
  {
    id: "updatedAt",
    header: "Updated",
    align: "right",
    render: (item) => <span className="text-sm text-slate-500">{item.updatedAt}</span>,
  },
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label} title={metric.label}>
            <div className="space-y-2">
              <p className="text-3xl font-semibold text-slate-900">{metric.value.toLocaleString()}</p>
              <p className="text-sm text-slate-500">{metric.delta}</p>
            </div>
          </Card>
        ))}
      </section>

      <Card title="Recent channel activity" description="Latest updates across managed channels.">
        <Table data={recentChannels} columns={columns} />
      </Card>
    </div>
  );
}