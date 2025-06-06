import { formatDistanceToNow } from "date-fns";
import { useState } from "preact/hooks";

export const ClickableDateSpan = ({ timestamp }: { timestamp: number }) => {
	const [isRelative, setIsRelative] = useState(true);

	const date = new Date(timestamp * 1000);
	const dateString = date.toLocaleString();
	const relativeDateString = formatDistanceToNow(date, {
		addSuffix: true,
	});

	return (
		<span
			onClick={() => setIsRelative(!isRelative)}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					setIsRelative(!isRelative);
				}
			}}
		>
			{isRelative ? relativeDateString : dateString}
		</span>
	);
};
