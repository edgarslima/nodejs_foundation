import Link from "next/link";
import { Button } from "@/components/admin/Button";
import { Card } from "@/components/admin/Card";
import { Input } from "@/components/admin/Input";
import { Select } from "@/components/admin/Select";
import { Textarea } from "@/components/admin/Textarea";

export default function AdminCreateChannelPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create channel</h1>
        <p className="text-sm text-slate-500">Define metadata and encryption details for a new publishing channel.</p>
      </div>

      <Card>
        <form className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="channelCode">
                Channel code
              </label>
              <Input id="channelCode" name="channelCode" placeholder="Unique identifier" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="name">
                Channel name
              </label>
              <Input id="name" name="name" placeholder="Channel display name" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700" htmlFor="description">
              Description
            </label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Brief summary about this channel"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
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
              <Input id="lastPublishAt" name="lastPublishAt" type="datetime-local" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="cipher">
                Publish token cipher (base64)
              </label>
              <Input id="cipher" name="cipher" placeholder="AES-256-GCM cipher" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="iv">
                Initialization vector (base64)
              </label>
              <Input id="iv" name="iv" placeholder="Initialization vector" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700" htmlFor="tag">
                Auth tag (base64)
              </label>
              <Input id="tag" name="tag" placeholder="Authentication tag" required />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4">
            <Link href="/admin/channels" className="text-sm font-medium text-blue-600 hover:underline">
              Cancel and go back
            </Link>
            <div className="flex items-center gap-3">
              <Button variant="secondary" type="reset">
                Reset form
              </Button>
              <Button type="submit">Save channel</Button>
            </div>
          </div>
        </form>
      </Card>
    </div>
  );
}