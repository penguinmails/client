import { Button } from "@/components/ui/button/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { getTemplateById, updateTemplate } from "@features/campaigns/actions/templates";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

async function handleUpdateTemplate(formData: FormData): Promise<void> {
  "use server";
  await updateTemplate(formData);
}

async function page({ params }: { params: { id: string } }) {
  const { id } = params;
  const currentTemplate = await getTemplateById(id);
  if (!currentTemplate) {
    notFound();
  }
  const { name, category, content, subject } = currentTemplate;

  return (
    <div className="p-3">
      <Card>
        <CardHeader>
          <div className="flex justify-between">
            <div className="flex  gap-2 items-start">
              <Link href="/dashboard/templates">
                <Button
                  variant="link"
                  size="icon"
                  asChild
                  className="text-gray-400"
                >
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div className="flex flex-col gap-2">
                <CardTitle className="text-lg">{name}</CardTitle>
                <CardDescription>{category}</CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/dashboard/templates/${id}`}>Cancel</Link>
              </Button>
              <Button type="submit" form="edit-form">
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="space-y-6">
          <form action={handleUpdateTemplate} id="edit-form">
            <input type="hidden" name="id" value={id} />
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                Template Name
              </h3>
              <Input
                className="text-gray-900 dark:text-foreground"
                defaultValue={name}
                name="name"
                required
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                Subject Line
              </h3>
              <Input
                className="text-gray-900 dark:text-foreground"
                defaultValue={subject}
                name="subject"
                required
              />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-foreground mb-2">
                Email Content
              </h3>
              <Textarea
                className="text-gray-900 dark:text-foreground h-64"
                defaultValue={content}
                name="content"
                required
              />
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default page;
