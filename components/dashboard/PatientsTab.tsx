"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, LoaderCircle, Eye, LayoutGrid, List } from "lucide-react";
import { executeGraphQL } from "@/lib/client/graphql";
import type { Patient } from "@/lib/domain";

type PatientsApiResponse = {
  patients: {
    items: Patient[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  };
};

const PAGE_SIZE = 8;

const PatientsTab = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "visual">("table");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["patients", search],
      initialPageParam: 1,
      queryFn: ({ pageParam }) =>
        executeGraphQL<PatientsApiResponse>(
          `query PatientsPage($page: Int!, $pageSize: Int!, $search: String) {
            patients(page: $page, pageSize: $pageSize, search: $search) {
              items {
                id
                name
                age
                email
                phone
                avatar
                lastVisit
                metrics {
                  date
                  weight
                  height
                  bmi
                  bodyFat
                  muscleMass
                  bodyWater
                  metabolicAge
                  leanBodyMass
                  inorganicSalts
                  smm
                  bfp
                }
                metricsHistory {
                  date
                  weight
                  height
                  bmi
                  bodyFat
                  muscleMass
                  bodyWater
                  metabolicAge
                  leanBodyMass
                  inorganicSalts
                  smm
                  bfp
                }
              }
              pagination { page pageSize total totalPages }
            }
          }`,
          {
            page: pageParam,
            pageSize: PAGE_SIZE,
            search: search || null,
          },
        ),
      getNextPageParam: (lastPage) => {
        const pagination = lastPage.patients.pagination;
        return pagination.page < pagination.totalPages
          ? pagination.page + 1
          : undefined;
      },
      staleTime: 15000,
    });

  const items = useMemo(
    () => data?.pages.flatMap((page) => page.patients.items) ?? [],
    [data],
  );

  const total = data?.pages[0]?.patients.pagination.total ?? 0;

  useEffect(() => {
    if (!sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0,
      },
    );

    observer.observe(sentinelRef.current);
    return () => {
      observer.disconnect();
    };
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-semibold text-foreground">
          Patients
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              className="pl-8 h-8 text-sm bg-card border-border text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="flex items-center rounded-lg border border-border bg-card p-0.5">
            <Button
              type="button"
              size="sm"
              variant={viewMode === "table" ? "default" : "ghost"}
              onClick={() => setViewMode("table")}
              className="h-7 px-2"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant={viewMode === "visual" ? "default" : "ghost"}
              onClick={() => setViewMode("visual")}
              className="h-7 px-2"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        <div className="rounded-xl border border-border overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Name
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Age
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Last Visit
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  Weight
                </TableHead>
                <TableHead className="text-xs text-muted-foreground font-medium py-2">
                  BMI
                </TableHead>
                <TableHead className="py-2" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((p) => (
                <TableRow
                  key={p.id}
                  className="hover:bg-muted/20 cursor-pointer"
                  onClick={() => router.push(`/dashboard/patient/${p.id}`)}
                >
                  <TableCell className="py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                        {p.avatar}
                      </div>
                      <span className="text-foreground text-sm font-medium">
                        {p.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.age}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm py-2">
                    {p.lastVisit}
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.metrics.weight} kg
                  </TableCell>
                  <TableCell className="text-foreground text-sm py-2">
                    {p.metrics.bmi}
                  </TableCell>
                  <TableCell className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {items.map((p) => (
            <div
              key={p.id}
              className="rounded-xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/20 transition-colors"
              onClick={() => router.push(`/dashboard/patient/${p.id}`)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    {p.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {p.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {p.age} years old
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-7 w-7 p-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/dashboard/patient/${p.id}`);
                  }}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">Visit</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.lastVisit}
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">Weight</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.metrics.weight} kg
                  </p>
                </div>
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-muted-foreground">BMI</p>
                  <p className="text-foreground font-medium mt-0.5">
                    {p.metrics.bmi}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <p className="text-xs text-muted-foreground">
          {total === 0 ? "0 results" : `${items.length} loaded of ${total}`}
        </p>
        {(isFetching || isFetchingNextPage) && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
            <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> Loading...
          </div>
        )}
      </div>

      <div ref={sentinelRef} className="h-1 w-full" aria-hidden="true" />
    </div>
  );
};

export default PatientsTab;
