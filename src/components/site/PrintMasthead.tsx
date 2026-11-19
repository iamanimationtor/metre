/** Visible only when printing — a branded document header for PDF outputs. */
export default function PrintMasthead({ code, dateText }: { code?: string; dateText?: string }) {
  const date = dateText ?? new Intl.DateTimeFormat("fa-IR", { dateStyle: "long" }).format(new Date());
  return (
    <div className="hidden print:mb-6 print:block">
      <div className="flex items-center justify-between border-b-2 border-slate-900 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl" aria-hidden>🏗️</span>
          <div>
            <p className="text-base font-black">HERMIMETR — سیستم متره و برآورد هزینه ساخت</p>
            <p className="text-[10px] text-slate-500">فهرست بهای سازمان برنامه و تعرفه نظام مهندسی · مبنای قیمت ۲۸ آبان ۱۴۰۵ با شاخص خودکار</p>
          </div>
        </div>
        <div className="text-left text-[10px] leading-5 tnum">
          {code && <p>کد پیگیری: <span dir="ltr">{code}</span></p>}
          <p>تاریخ صدور: {date}</p>
        </div>
      </div>
    </div>
  );
}
