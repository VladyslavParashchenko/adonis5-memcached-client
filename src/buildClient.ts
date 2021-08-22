import {
	AdonisMemcachedClientConfig,
	AdonisMemcachedClientContract,
} from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'
import { promisify } from 'util'
import Memcached from 'memcached'

const methodsForPromisification = [
	'touch',
	'get',
	'gets',
	'getMulti',
	'set',
	'replace',
	'add',
	'cas',
	'append',
	'prepend',
	'incr',
	'decr',
	'del',
	'version',
	'settings',
	'stats',
	'slabs',
	'items',
	'cachedump',
	'flush',
	'on',
]
export default function (config: AdonisMemcachedClientConfig): AdonisMemcachedClientContract {
	const { server, ...options } = config
	const client = new Memcached(server, options)
	for (const methodName of methodsForPromisification) {
		client[methodName] = promisify(client[methodName])
	}

	return client as any as AdonisMemcachedClientContract
}
