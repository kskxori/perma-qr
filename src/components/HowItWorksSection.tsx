export function HowItWorksSection() {
  const rows = [
    {
      property: 'What is stored inside the QR matrix',
      direct: 'Your exact destination URL directly',
      dynamic: 'A third-party short redirect URL (e.g., qr.vendor.com/x8k)',
    },
    {
      property: 'Expiration or scan limits',
      direct: 'Never expires, unlimited scans forever',
      dynamic: 'Breaks after free trial ends or scan cap is reached',
    },
    {
      property: 'Dependence on external servers',
      direct: 'Zero — works even if this website goes offline',
      dynamic: 'Stops working if the redirect service shuts down',
    },
    {
      property: 'Monthly subscription cost',
      direct: '$0 forever',
      dynamic: '$5–$39/month to keep links active',
    },
    {
      property: 'Visitor privacy',
      direct: 'Direct navigation with zero tracking middlemen',
      dynamic: 'Logs IP addresses and device data on redirect',
    },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-8 space-y-6">
      <div className="max-w-2xl space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Why These QR Codes Never Expire
        </h2>
        <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
          Many online QR generators create dynamic redirect links that expire after a 14-day trial
          unless you pay a monthly fee. PermaQR encodes your destination URL directly into the
          ISO/IEC 18004 geometric grid inside your browser, so the printed code works as long as
          your target website exists.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-5 py-3.5 font-semibold text-slate-700 w-1/3">Property</th>
              <th className="px-5 py-3.5 font-semibold text-blue-700 w-1/3">
                PermaQR (Direct Static QR)
              </th>
              <th className="px-5 py-3.5 font-semibold text-slate-600 w-1/3">
                Typical Paid Dynamic QR
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rows.map((row) => (
              <tr key={row.property} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5 font-medium text-slate-900">{row.property}</td>
                <td className="px-5 py-3.5 text-slate-800">{row.direct}</td>
                <td className="px-5 py-3.5 text-slate-500">{row.dynamic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
