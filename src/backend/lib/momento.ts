import {
	CacheClient,
	type CacheClient as CacheClientType,
	CacheDeleteResponse,
	CacheGetResponse,
	CacheSetResponse,
	Configurations,
	CredentialProvider,
} from "@gomomento/sdk-web";
import XMLHttpRequestPolyfill from "xhr4sw";

export enum Ttl {
	Short = 60, // 60 seconds
	Medium = 14400, // 4 hours
	Long = 30 * 24 * 60 * 60, // 30 days
}

/**
 * This is needed to polyfill as otherwise we get HttpRequest not defined
 */
Object.defineProperty(self, "XMLHttpRequest", {
	configurable: false,
	enumerable: true,
	writable: false,
	value: XMLHttpRequestPolyfill,
});

class MomentoFetcher {
	private readonly momento: CacheClientType;

	constructor(env: Env, defaultTtlSeconds = Ttl.Short) {
		this.momento = new CacheClient({
			configuration: Configurations.Laptop.v1(),
			credentialProvider: CredentialProvider.fromString({
				apiKey: env.MOMENTO_API_KEY,
			}),
			defaultTtlSeconds,
		});
	}

	async get(cacheName: string, key: string) {
		const getResponse = await this.momento.get(cacheName, key);
		switch (getResponse.type) {
			case CacheGetResponse.Miss:
				break;
			case CacheGetResponse.Hit:
				break;
			case CacheGetResponse.Error:
				throw new Error(
					`Error retrieving key ${key}: ${getResponse.message()}`,
				);
		}
		return getResponse;
	}

	async set(cacheName: string, key: string, value: string, ttl_seconds = 30) {
		const setResponse = await this.momento.set(cacheName, key, value, {
			ttl: ttl_seconds,
		});

		switch (setResponse.type) {
			case CacheSetResponse.Success:
				break;
			case CacheSetResponse.Error:
				throw new Error(`Error setting key ${key}: ${setResponse.toString()}`);
		}

		return;
	}

	async delete(cacheName: string, key: string) {
		const delResponse = await this.momento.delete(cacheName, key);
		switch (delResponse.type) {
			case CacheDeleteResponse.Success:
				break;
			case CacheDeleteResponse.Error:
				throw new Error(
					`failed to delete ${key} from cache. Message: ${delResponse.message()}; cache: ${cacheName}`,
				);
		}

		return;
	}
}

export default MomentoFetcher;
