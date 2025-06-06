import type { ContentfulStatusCode } from "hono/utils/http-status";
import invariant from "tiny-invariant";
import { z } from "zod";
import type { DecentBookmark } from "../../shared/types";

const endpoint = "https://decent-bookmarks.artlu.xyz/?fid=";

const GetDecentBookmarksResponseSchema = z.object({
	bookmarks: z.array(
		z.object({
			timestamp: z.number(),
			fid: z.number(),
			username: z.string(),
			hash: z.string(),
		}),
	),
});

export const getDecentBookmarks = async (
	env: Env,
	fid: number,
	limit = 100,
) => {
	invariant(env.DECENT_BOOKMARKS_SECRET, "DECENT_BOOKMARKS_SECRET is not set");

	const response = await fetch(`${endpoint}${fid}`, {
		headers: { Authorization: `Basic ${env.DECENT_BOOKMARKS_SECRET}` },
	});
	const data = await response.json();
	try {
		const parsedData = GetDecentBookmarksResponseSchema.parse(data);
		return parsedData.bookmarks
			.slice()
			.sort((a, b) => b.timestamp - a.timestamp)
			.slice(0, limit);
	} catch (error) {
		console.error(error);
		throw new Error("Error while parsing decent bookmarks");
	}
};

export const saveDecentBookmark = async (
	env: Env,
	bookmark: DecentBookmark,
) => {
	invariant(env.DECENT_BOOKMARKS_SECRET, "DECENT_BOOKMARKS_SECRET is not set");
	const { fid } = bookmark;
	try {
		const response = await fetch(`${endpoint}${fid}`, {
			method: "POST",
			body: JSON.stringify(bookmark),
			headers: {
				"Content-Type": "application/json",
				Authorization: `Basic ${env.DECENT_BOOKMARKS_SECRET}`,
			},
		});

		if (response.ok) {
			return { message: "Bookmark created", statusCode: 200 };
		}

		// don't use fetcher, it throws on all errors and we want to handle 403 without an error
		if (response.status === 403) {
			return { message: "Bookmark already exists", statusCode: 200 };
		}

		return {
			message: `Bookmark not created: ${response.statusText}`,
			statusCode: response.status as ContentfulStatusCode,
		};
	} catch (error) {
		return { message: "Error while creating bookmark", statusCode: 500 };
	}
};

export const deleteDecentBookmark = async (
	env: Env,
	fid: number,
	hash: string,
) => {
	invariant(env.DECENT_BOOKMARKS_SECRET, "DECENT_BOOKMARKS_SECRET is not set");

	const response = await fetch(`${endpoint}${fid}`, {
		method: "DELETE",
		body: JSON.stringify({ hash }),
		headers: { Authorization: `Basic ${env.DECENT_BOOKMARKS_SECRET}` },
	});

	if (response.ok) {
		return { message: "Bookmark deleted", statusCode: 200 };
	}

	return { message: "Error while deleting bookmark", statusCode: 500 };
};
