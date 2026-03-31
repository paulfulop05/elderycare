import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("w-full p-2 sm:p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4",
        month: "space-y-4 w-full",
        month_caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-semibold tracking-tight",
        nav: "space-x-1 flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 h-8 w-8 bg-background p-0 opacity-70 hover:opacity-100",
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 h-8 w-8 bg-background p-0 opacity-70 hover:opacity-100",
        ),
        month_grid: "mx-auto border-collapse space-y-1",
        weekdays: "flex",
        weekday:
          "text-muted-foreground w-10 h-10 font-medium text-[0.8rem] inline-flex items-center justify-center",
        week: "flex w-full mt-1",
        day: "h-10 w-10 p-0 text-center text-sm relative focus-within:relative focus-within:z-20",
        day_button:
          "inline-flex h-10 w-10 items-center justify-center rounded-xl border border-transparent bg-transparent p-0 text-sm font-normal text-foreground ring-offset-background transition-colors duration-150 hover:border-primary/30 hover:bg-primary/15 hover:text-foreground active:border-primary/40 active:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        range_end: "day-range-end",
        selected:
          "bg-transparent text-foreground [&>button]:!bg-primary [&>button]:!text-primary-foreground [&>button]:!border-primary [&>button]:hover:!bg-primary/85 [&>button]:rounded-xl",
        today:
          "bg-transparent text-primary font-semibold [&>button]:bg-primary/15 [&>button]:text-primary [&>button]:border-primary/30 [&>button]:rounded-xl",
        outside:
          "day-outside text-muted-foreground opacity-50 [&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:hover:border-transparent [&>button]:hover:bg-transparent [&>button]:hover:text-muted-foreground aria-selected:bg-transparent aria-selected:text-foreground aria-selected:opacity-100 aria-selected:[&>button]:opacity-100 aria-selected:[&>button]:border-primary aria-selected:[&>button]:bg-primary aria-selected:[&>button]:text-primary-foreground",
        disabled:
          "text-muted-foreground opacity-50 [&>button]:cursor-not-allowed [&>button]:text-muted-foreground [&>button]:opacity-50 [&>button]:hover:bg-transparent [&>button]:hover:text-muted-foreground",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, className, ...iconProps }) =>
          orientation === "left" ? (
            <ChevronLeft className={cn("h-4 w-4", className)} {...iconProps} />
          ) : (
            <ChevronRight className={cn("h-4 w-4", className)} {...iconProps} />
          ),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
