export default function Pagination({ page, totalPages, total, pageSize, onPage }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)

  const pages = []
  const delta = 2
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-800">{from}–{to}</span> of{' '}
        <span className="font-medium text-gray-800">{total}</span> employees
      </p>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="btn-secondary btn-sm px-2.5"
          aria-label="Previous"
        >
          ‹
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPage(1)} className="btn-secondary btn-sm w-8 justify-center">1</button>
            {pages[0] > 2 && <span className="text-gray-400 px-1 text-xs">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPage(p)}
            className={`btn btn-sm w-8 justify-center ${
              p === page
                ? 'bg-primary-600 text-white border-0 hover:bg-primary-700 focus:ring-primary-500'
                : 'btn-secondary'
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-400 px-1 text-xs">…</span>}
            <button onClick={() => onPage(totalPages)} className="btn-secondary btn-sm w-8 justify-center">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="btn-secondary btn-sm px-2.5"
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>
  )
}
