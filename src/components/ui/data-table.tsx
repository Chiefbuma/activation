"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import {
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface DataTableToolbarProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
  searchPlaceholder?: string
  toolbarActions?: React.ReactNode
}

export function DataTableToolbar<TData>({
  table,
  searchPlaceholder = "Search records...",
  toolbarActions,
}: DataTableToolbarProps<TData>) {
  const isFiltered = !!table.getState().globalFilter

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        {toolbarActions}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder={searchPlaceholder}
          value={(table.getState().globalFilter as string) ?? ""}
          onChange={(event) => table.setGlobalFilter(event.target.value)}
          className="h-9 min-w-[220px] max-w-[280px] shrink-0 border-border/70 bg-background text-[13px]"
        />
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.setGlobalFilter("")}
            className="h-9 shrink-0 px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
          >
            Reset
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

interface DataTablePaginationProps<TData> {
  table: ReturnType<typeof useReactTable<TData>>
}

export function DataTablePagination<TData>({ table }: DataTablePaginationProps<TData>) {
  const currentPage = table.getState().pagination.pageIndex + 1
  const totalPages = table.getPageCount()
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1).slice(
    Math.max(currentPage - 2, 0),
    Math.max(currentPage - 2, 0) + 5
  )
  const rowSelectionEnabled = table.options.enableRowSelection !== false

  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border/70 pt-3 sm:flex-row">
      <div className="text-xs text-muted-foreground">
        {rowSelectionEnabled
          ? `${table.getFilteredSelectedRowModel().rows.length} of ${table.getFilteredRowModel().rows.length} selected`
          : `${table.getFilteredRowModel().rows.length} records`}
      </div>
      <div className="flex flex-wrap items-center gap-3 lg:gap-4">
        <div className="flex items-center justify-center text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount()}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            className="h-8 w-8 border-border/70 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 border-border/70 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
          {pageNumbers.map((pageNumber) => (
            <Button
              key={pageNumber}
              variant={pageNumber === currentPage ? "default" : "outline"}
              className="h-8 min-w-8 border-border/70 px-2 text-xs"
              onClick={() => table.setPageIndex(pageNumber - 1)}
            >
              {pageNumber}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onSelectionChange?: (count: number, selectedRows: TData[]) => void
  searchPlaceholder?: string
  enableRowSelection?: boolean
  toolbarActions?: React.ReactNode
}

export function DataTable<TData, TValue>({ 
    columns, 
    data,
    onSelectionChange,
    searchPlaceholder,
    enableRowSelection = true,
    toolbarActions,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({})
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = React.useState('')

  const table = useReactTable({
    data,
    columns,
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
    },
    enableRowSelection,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  // STABILIZATION GUARD: Prevents React Error #185 by only triggering
  // the callback when the actual set of IDs has changed.
  const lastSelectionRef = React.useRef<string>('')
  
  React.useEffect(() => {
    const selectedRows = table.getFilteredSelectedRowModel().rows
    const currentSelectionIds = selectedRows.map(r => (r.original as any).id || r.id).sort().join(',')
    
    if (currentSelectionIds !== lastSelectionRef.current) {
      lastSelectionRef.current = currentSelectionIds
      if (onSelectionChange) {
        onSelectionChange(selectedRows.length, selectedRows.map(r => r.original))
      }
    }
  }, [rowSelection, table, onSelectionChange])

  return (
    <div className="space-y-3">
      <DataTableToolbar
        table={table}
        searchPlaceholder={searchPlaceholder}
        toolbarActions={toolbarActions}
      />
      <Table className="min-w-[720px]">
        <TableHeader className="bg-muted/35">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="hover:bg-transparent">
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="transition-colors hover:bg-primary/5"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="text-[13px]">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                No records found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <DataTablePagination table={table} />
    </div>
  )
}
