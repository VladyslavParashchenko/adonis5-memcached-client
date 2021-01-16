declare module '@ioc:Adonis/Addons/Adonis5-MemcachedClient' {
	import {
		CacheDumpData,
		EventNames,
		IssueData,
		Location,
		options,
		StatusData,
		VersionData,
	} from 'memcached'

	export type AdonisMemcachedClientConfig = options & { server: Location }

	export type ValueType = number | string | object | boolean | Buffer

	type CachedValue = ValueType | ValueType[]

	export interface AdonisMemcachedClientContract {
		get<T = CachedValue>(key: string): Promise<T | undefined>

		touch(key: string, lifetime: number): Promise<boolean>

		gets<T = CachedValue>(
			key: string
		): Promise<{ [key: string]: CachedValue; cas: string } | undefined>

		getMulti<T = CachedValue>(keys: string[]): Promise<Record<string, T>>

		set(key: string, value: CachedValue, lifetime: number): Promise<boolean>

		replace(key: string, value: CachedValue, lifetime: number): Promise<boolean>

		cas(key: string, value: CachedValue, cas: string, ttl: number): Promise<boolean>

		add(key: string, value: CachedValue, lifetime: number): Promise<boolean>

		append(key: string, value: string): Promise<boolean>

		prepend(key: string, value: string): Promise<boolean>

		incr(key: string, value: number): Promise<false | number>

		decr(key: string, value: number): Promise<false | number>

		del(key: string): Promise<boolean>

		version(): Promise<VersionData[]>

		settings(): Promise<StatusData[]>

		stats(): Promise<StatusData[]>

		slabs(): Promise<StatusData[]>

		items(): Promise<StatusData[]>

		cachedump(
			server: Location,
			slabid: number,
			number: number
		): Promise<CacheDumpData | CacheDumpData[]>

		flush(): Promise<[boolean]>

		on(event: EventNames, cb: (err: IssueData) => void): this

		end(): void
	}

	const client: AdonisMemcachedClientContract

	export default client
}
