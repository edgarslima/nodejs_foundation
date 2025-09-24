import Link from "next/link";
import { Badge } from "@/components/admin/Badge";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";
import { cn } from "@/lib/cn";

type ChannelDetailsPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChannelDetailsPage({ params }: ChannelDetailsPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Channel #{id}</h1>
          <p className="text-sm text-slate-500">Review and update channel configuration.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge tone="success">Active</Badge>
          <Button
            variant="secondary"
            className={cn("border-rose-200 text-rose-600 hover:bg-rose-50")}
          >
            Pause channel
          </Button>
        </div>
      </div>

      <Card title="Metadata">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="name">
              Channel name
            </label>
            <Input id="name" name="name" defaultValue="Education Weekly" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="channelCode">
              Channel code
            </label>
            <Input id="channelCode" name="channelCode" defaultValue="EDU-01" />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              defaultValue="Weekly curated educational content for teachers and students."
              rows={4}
            />
          </div>
        </div>
      </Card>

      <Card title="Publishing settings">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="status">
              Status
            </label>
            <Select id="status" name="status" defaultValue="active">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="lastPublishAt">
              Last publish date
            </label>
            <Input id="lastPublishAt" name="lastPublishAt" type="datetime-local" defaultValue="2025-09-19T17:30" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="category">
              Primary category
            </label>
            <Select id="category" name="category" defaultValue="education">
              <option value="education">Education</option>
              <option value="comedy">Comedy</option>
              <option value="technology">Technology</option>
            </Select>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/channels" className="text-sm font-medium text-blue-600 hover:underline">
          Back to list
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="secondary">Discard changes</Button>
          <Button>Save changes</Button>
        </div>
      </div>
    </div>
  );
}