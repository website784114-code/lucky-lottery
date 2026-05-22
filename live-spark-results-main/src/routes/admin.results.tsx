import { createFileRoute } from "@tanstack/react-router";
import { ManageResults } from "@/components/admin/ManageResults";

export const Route = createFileRoute("/admin/results")({ component: ManageResults });
