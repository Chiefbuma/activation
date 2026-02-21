
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Square, UserPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { placeholderImages } from "@/lib/placeholder-images"
import type { Registration } from "@/lib/types"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

const ViewActivationButton = ({ registration }: { registration: Registration }) => {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsLoading(true);
        router.push(`/dashboard/patient/${registration.id}`);
    };

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9 border-primary/20 hover:border-primary hover:bg-primary/5 transition-colors"
                        onClick={handleClick}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Square className="h-4 w-4 text-primary" />
                        )}
                        <span className="sr-only">View Details</span>
                    </Button>
                </TooltipTrigger>
                <TooltipContent>
                    <p>View Details</p>
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
                {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} data-ai-hint="African avatar" />}
                <AvatarFallback className="bg-primary/10 text-primary font-bold">{fallback}</AvatarFallback>
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
    cell: ({ row }) => {
      const reg = row.original;
      return (
        <div className="grid gap-1">
          <div className="font-medium leading-none">{reg.corporate_name || 'Individual'}</div>
          {reg.wellness_date && (
            <p className="text-sm text-muted-foreground">
              {new Date(reg.wellness_date).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex justify-end pr-4">
          <ViewActivationButton registration={row.original} />
        </div>
      )
    },
  },
]
