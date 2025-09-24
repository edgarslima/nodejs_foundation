import Link from "next/link";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Table, type TableColumn } from "@/components/admin/Table";
import { cn } from "@/lib/cn";

const CHANNEL_STATUSES = ["Active", "Draft", "Paused"] as const;

type ChannelRow = {
  id: string;
  code: string;
  name: string;
  categories: string[];
  status: (typeof CHANNEL_STATUSES)[number];
  updatedAt: string;
};

const channels: ChannelRow[] = [
  {
    id: "1",
    code: "EDU-01",
    name: "Education Weekly",
    categories: ["Education", "News"],
    status: "Active",
    updatedAt: "2025-09-19",
  },
  {
    id: "2",
    code: "COM-02",
    name: "Comedy Central Station",
    categories: ["Comedy"],
    status: "Paused",
    updatedAt: "2025-09-18",
  },
  {
    id: "3",
    code: "TEC-11",
    name: "Tech Insights Daily",
    categories: ["Technology"],
    status: "Draft",
    updatedAt: "2025-09-18",
  },
];

const columns: Array<TableColumn<ChannelRow>> = [
  {
    id: "name",
    header: "Channel",
    render: (item) => (
      <div className="space-y-1">
        <Link href={`/admin/channels/${item.id}`} className="font-semibold text-blue-600 hover:underline">
          {item.name}
        </Link>
        <p className="text-xs text-slate-500">Code: {item.code}</p>
      </div>
    ),
  },
  {
    id: "categories",
    header: "Categories",
    render: (item) => (
      <div className="flex flex-wrap gap-1">
        {item.categories.map((category) => (
          <Badge key={category} tone="default">
            {category}
          </Badge>
        ))}
      </div>
    ),
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

export default function AdminChannelsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Channels</h1>
          <p className="text-sm text-slate-500">Manage publishing destinations and monitor their status.</p>
        </div>
        <Link
          href="/admin/channels/new"
          className={cn(
            "inline-flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          )}
        >
          Create channel
        </Link>
      </div>

      <Card>
        <div className="flex flex-wrap items-center gap-4">
          <div className="w-full sm:w-64">
            <Input placeholder="Search channels" aria-label="Search channels" />
          </div>
          <div className="w-full sm:w-48">
            <Select defaultValue="">
              <option value="">All statuses</option>
              {CHANNEL_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>
          <div className="w-full sm:w-48">
            <Select defaultValue="">
              <option value="">All categories</option>
              <option value="education">Education</option>
              <option value="comedy">Comedy</option>
              <option value="technology">Technology</option>
            </Select>
          </div>
          <Button variant="secondary">Filters</Button>
        </div>
      </Card>

      <Card>
        <Table data={channels} columns={columns} caption="Showing 1-3 of 45 channels" />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 px-2">
          <p className="text-sm text-slate-500">Page 1 of 15</p>
          <div className="flex items-center gap-2">
            <Button variant="secondary">Previous</Button>
            <Button variant="secondary">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}