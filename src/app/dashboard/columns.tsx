"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { placeholderImages } from "@/lib/placeholder-images"
import type { Registration } from "@/lib/types"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

const ViewActivationButton = ({ registration }: { registration: Registration }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const isPending = registration.status === 'Pending';

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        router.push(`/dashboard/patient/${registration.id}`);
    };

    const actionLabel = isPending ? 'Complete Activation' : 'View Details';
    const ActionIcon = isPending ? UserPlus : Eye;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <ActionIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">{actionLabel}</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{actionLabel}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};


export const columns: ColumnDef<Registration>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "first_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Participant Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const reg = row.original
      const name = `${reg.first_name} ${reg.surname || ''}`
      const fallback = reg.first_name[0]

      return (
        <div className="flex items-center gap-4">
            <Avatar className="hidden h-10 w-10 sm:flex">
                {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} />}
                <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
                <Link href={`/dashboard/patient/${reg.id}`} className="font-medium leading-none hover:underline">{name}</Link>
                <p className="text-sm text-muted-foreground">{reg.email || reg.phone}</p>
            </div>
        </div>
      )
    },
  },
  {
    accessorKey: "corporate_name",
    header: "Corporate",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const variant = status === 'Active' ? 'default' : 'secondary';
      return <Badge variant={variant} className={cn(status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30')}>{status}</Badge>
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end">
          <ViewActivationButton registration={row.original} />
        </div>
      )
    },
  },
]
