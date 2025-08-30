import * as React from "react";

function cx(...cls: (string | undefined | false)[]) {
  return cls.filter(Boolean).join(" ");
}

type BoxProps = React.HTMLAttributes<HTMLDivElement> & { className?: string };

export function Card({ className, children, ...rest }: BoxProps) {
  return (
    <div
      {...rest}
      className={cx(
        "bg-white rounded-2xl ring-1 ring-slate-200 shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ className, children, ...rest }: BoxProps) {
  return (
    <div {...rest} className={cx("p-5 md:p-6", className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...rest }: BoxProps) {
  return (
    <div
      {...rest}
      className={cx("text-sm font-semibold text-slate-900 tracking-tight", className)}
    >
      {children}
    </div>
  );
}
