import { type ReactElement, type ReactNode, useState } from 'react';
import { Button } from './Button';

export interface Column<Row> {
	key: string;
	header: string;
	render: (row: Row) => ReactNode;
	isNumeric?: boolean;
}

export interface DataTableProps<Row> {
	caption: string;
	columns: ReadonlyArray<Column<Row>>;
	rows: ReadonlyArray<Row>;
	getRowKey: (row: Row) => string;
	pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 20;

// DESIGN data-table: quiet header, 48px rows, hairline rows only, tabular numbers,
// "Previous / Next" pagination with a "Showing 1–20 of 64" caption. Scrolls inside its own box.
export function DataTable<Row>({
	caption,
	columns,
	rows,
	getRowKey,
	pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<Row>): ReactElement {
	const [requestedPage, setRequestedPage] = useState(0);
	const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
	// Rows can shrink after a reload; never point past the last page.
	const page = Math.min(requestedPage, pageCount - 1);
	const firstIndex = page * pageSize;
	const visibleRows = rows.slice(firstIndex, firstIndex + pageSize);

	return (
		<div className="data-table">
			<div className="data-table__scroll" role="region" aria-label={caption} tabIndex={0}>
				<table className="data-table__table">
					<caption className="visually-hidden">{caption}</caption>
					<thead>
						<tr>
							{columns.map((column) => (
								<th
									key={column.key}
									scope="col"
									className={column.isNumeric ? 'data-table__numeric' : undefined}
								>
									{column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{visibleRows.map((row) => (
							<tr key={getRowKey(row)}>
								{columns.map((column) => (
									<td
										key={column.key}
										className={
											column.isNumeric ? 'data-table__numeric' : undefined
										}
									>
										{column.render(row)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
			{pageCount > 1 ? (
				<div className="data-table__pagination">
					<p className="data-table__range">
						Showing {firstIndex + 1}–{firstIndex + visibleRows.length} of {rows.length}
					</p>
					<Button disabled={page === 0} onClick={() => setRequestedPage(page - 1)}>
						Previous
					</Button>
					<Button
						disabled={page >= pageCount - 1}
						onClick={() => setRequestedPage(page + 1)}
					>
						Next
					</Button>
				</div>
			) : null}
		</div>
	);
}
