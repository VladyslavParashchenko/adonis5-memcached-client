import { AdonisMemcachedClientContract } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'
import buildClient from '../src/buildClient'
import memcachedClientConfig from './fixtures/client-config'
import MemcachedCallBackClient from 'memcached'
import Memcached from 'memcached'
import { sleep } from './utils'

describe('AdonisMemcachedClient - client builder', () => {
	let client: AdonisMemcachedClientContract
	let callbackClient: Memcached

	beforeAll(async () => {
		client = buildClient(memcachedClientConfig)
		callbackClient = new MemcachedCallBackClient(memcachedClientConfig.server)
	})

	describe('get method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should return value from cache', async () => {
			const cachedValue = await client.get('test')

			expect(cachedValue).toEqual('test-value')
		})

		test('should return undefined, value by key does not exist', async () => {
			const cachedValue = await client.get('non-existent-key')

			expect(cachedValue).toBeUndefined()
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should return undefined, lifetime is over', async () => {
				await sleep(1)
				const cachedValue = await client.get('ttl-test')

				expect(cachedValue).toBeUndefined()
			})
		})
	})

	describe('touch method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should return true, value exists in cache', async () => {
			const cachedValue = await client.touch('test', 1)

			expect(cachedValue).toBeTruthy()
		})

		test('should return undefined, value does not exist', async () => {
			const cachedValue = await client.touch('non-existent-key', 1)

			expect(cachedValue).toBeFalsy()
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should return undefined, lifetime is over', async () => {
				await sleep(1)
				const cachedValue = await client.touch('ttl-test', 1)

				expect(cachedValue).toBeFalsy()
			})
		})
	})

	describe('gets method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should return value from cache and cas, value exists in cache', async () => {
			const operationResult = await client.gets('test')

			expect(operationResult).toMatchObject({
				test: 'test-value',
				cas: expect.any(String),
			})
		})

		test('should return undefined, value does not exist', async () => {
			const cachedValue = await client.gets('non-existent-key')

			expect(cachedValue).toBeUndefined()
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should return undefined, lifetime is over', async () => {
				await sleep(1)
				const cachedValue = await client.gets('ttl-test')

				expect(cachedValue).toBeUndefined()
			})
		})
	})

	describe('getMulti method', () => {
		beforeEach((done) => {
			callbackClient.set('test-1', 'test-value', 60, () => {
				callbackClient.set('test-2', 'test-value', 60, () => {
					callbackClient.set('test-3', 'test-value', 60, () => {
						done()
					})
				})
			})
		})

		test('should return values from cache', async () => {
			const operationResult = await client.getMulti(['test-1', 'test-2', 'test-3'])

			expect(operationResult).toEqual({
				'test-1': 'test-value',
				'test-2': 'test-value',
				'test-3': 'test-value',
			})
		})

		test('should return undefined, value does not exist', async () => {
			const operationResult = await client.getMulti(['test-1', 'non-existent-key'])

			expect(operationResult).toEqual({
				'test-1': 'test-value',
			})
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test-1', 'test-value', 1, () => {
					callbackClient.set('ttl-test-2', 'test-value', 1, () => {
						done()
					})
				})
			})

			test('should return empty object, lifetime is over for each keys', async () => {
				await sleep(2)
				const operationResult = await client.getMulti(['ttl-test-1', 'ttl-test-2'])

				expect(operationResult).toEqual({})
			})
		})
	})

	describe('add method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should not add value and throw exception, key already exists in cache', async () => {
			const operation = async () => await client.add('test', 'new-test-value', 10)

			await expect(operation()).rejects.toThrow('Item is not stored')
		})

		test('should return true, new value added to cache', async () => {
			const operation = async () => await client.add('new-key', 'new-test-value', 10)

			await expect(operation()).resolves.toBeTruthy()
			return Promise.resolve((done) => {
				callbackClient.get('new-key', (_, value) => {
					expect(value).toEqual('new-test-value')
					done()
				})
			})
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should add new key to cache, old record lifetime is over', async () => {
				await sleep(1)
				const operation = async () => await client.add('ttl-test', 'new-test-value', 10)

				await expect(operation()).resolves.toBeTruthy()

				return Promise.resolve((done) => {
					callbackClient.get('new-key', (_, value) => {
						expect(value).toEqual('new-test-value')
						done()
					})
				})
			})
		})
	})

	describe('cas method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should replace value in cache', async () => {
			const { cas } = <{ cas: string }>await client.gets('test')

			const result = await client.cas('test', 'new-value', cas, 100)
			expect(result).toEqual(true)

			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value: string) => {
					expect(value).toEqual('new-value')
					done()
				})
			})
		})

		test("should return undefined as operation result, key doesn't exist in cache", async () => {
			const result = await client.gets('non-existence-key')
			expect(result).toBeUndefined()
		})

		test('should not write new value to the cache, cas is not correct', async () => {
			const result = await client.cas('test', 'new-value', '0', 100)

			expect(result).toEqual(false)
			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value: string) => {
					expect(value).toEqual('test-value')
					done()
				})
			})
		})
	})

	describe('append method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should append value to value, which stored in cache', async () => {
			const operationResult = await client.append('test', '-postfix')
			expect(operationResult).toBeTruthy()

			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value) => {
					expect(value).toEqual('test-value-postfix')
					done()
				})
			})
		})

		test('should throw exception, value for appending does not exist in cache', async () => {
			const operation = async () => await client.append('non-existent-key', '-postfix')

			await expect(operation()).rejects.toThrow('Item is not stored')
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should throw exception, lifetime old record for appending is over', async () => {
				await sleep(1)
				const operation = async () => await client.append('ttl-test', '-postfix')

				await expect(operation()).rejects.toThrow('Item is not stored')
			})
		})
	})

	describe('prepend method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should prepend value to value, which stored in cache', async () => {
			const operationResult = await client.prepend('test', 'prefix-')
			expect(operationResult).toBeTruthy()

			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value) => {
					expect(value).toEqual('prefix-test-value')
					done()
				})
			})
		})

		test('should throw exception, value for prepending does not exist in cache', async () => {
			const operation = async () => await client.prepend('non-existent-key', 'prefix-')

			await expect(operation()).rejects.toThrow('Item is not stored')
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should throw exception, lifetime old record for prepending is over', async () => {
				await sleep(1)
				const operation = async () => await client.prepend('ttl-test', 'prefix-')

				await expect(operation()).rejects.toThrow('Item is not stored')
			})
		})

		describe('when cache value is number', () => {
			beforeEach((done) => {
				callbackClient.set('test', 25, 60, () => {
					done()
				})
			})

			test('should prepend value to numeric value in cache, NaN as result', async () => {
				await sleep(1)
				const operation = async () => await client.prepend('test', 'prefix')

				await expect(operation()).resolves.toBeTruthy()

				return Promise.resolve((done) => {
					callbackClient.get('test', (_, value) => {
						expect(value).toBeNaN()
						done()
					})
				})
			})
		})
	})

	describe('incr method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 100, 60, () => {
				done()
			})
		})

		test('should increment value to value, which stored in cache', async () => {
			const operationResult = await client.incr('test', 100)
			expect(operationResult).toEqual(200)

			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value) => {
					expect(value).toEqual(200)
					done()
				})
			})
		})

		test('should return false, value for increment does not exist in cache', async () => {
			const operation = async () => await client.incr('non-existent-key', 100)

			await expect(operation()).resolves.toEqual(false)
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should return false, lifetime old record for increment is over', async () => {
				await sleep(1)
				const operation = async () => await client.incr('ttl-test', 100)

				await expect(operation()).resolves.toEqual(false)
			})
		})

		describe('when value in cache is not string', () => {
			beforeEach((done) => {
				callbackClient.set('string-value', 'test-value', 100, () => {
					done()
				})
			})

			test('should throw error, increment operation expected only numeric value in cache', async () => {
				await sleep(1)
				const operation = async () => await client.incr('string-value', 100)

				await expect(operation()).rejects.toThrow('cannot increment or decrement non-numeric value')
			})
		})
	})

	describe('decr method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 100, 60, () => {
				done()
			})
		})

		test('should decrement value to value, which stored in cache', async () => {
			const operationResult = await client.decr('test', 100)
			expect(operationResult).toEqual(0)

			return Promise.resolve((done) => {
				callbackClient.get('test', (_, value) => {
					expect(value).toEqual(0)
					done()
				})
			})
		})

		test('should return false, value for decrement does not exist in cache', async () => {
			const operation = async () => await client.decr('non-existent-key', 100)

			await expect(operation()).resolves.toEqual(false)
		})

		describe('when lifetime is over', () => {
			beforeEach((done) => {
				callbackClient.set('ttl-test', 'test-value', 1, () => {
					done()
				})
			})

			test('should return false, lifetime old record for decrement is over', async () => {
				await sleep(1)
				const operation = async () => await client.decr('ttl-test', 100)

				await expect(operation()).resolves.toEqual(false)
			})
		})

		describe('when value in cache is not string', () => {
			beforeEach((done) => {
				callbackClient.set('string-value', 'test-value', 100, () => {
					done()
				})
			})

			test('should throw error, decrement operation expected only numeric value in cache', async () => {
				await sleep(1)
				const operation = async () => await client.decr('string-value', 100)

				await expect(operation()).rejects.toThrow('cannot increment or decrement non-numeric value')
			})
		})
	})

	describe('del method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				done()
			})
		})

		test('should remove value from cache', async () => {
			const operationResult = await client.del('test')
			expect(operationResult).toBeTruthy()

			return Promise.resolve((done) => {
				callbackClient.get('test', (err, value) => {
					expect(err).toBeUndefined()
					expect(value).toBeUndefined()
					done()
				})
			})
		})

		test('should return false as operation result, value does not exist in cache', async () => {
			const operationResult = await client.del('non-existence-key')
			expect(operationResult).toBeFalsy()
		})
	})

	describe('version method', () => {
		test('should return info about connected memcached apps', async () => {
			const operationResult = await client.version()

			expect(operationResult).toMatchObject([
				{
					server: memcachedClientConfig.server,
					version: expect.any(String),
					major: expect.any(String),
					minor: expect.any(String),
					bugfix: expect.any(String),
				},
			])
		})
	})

	describe('settings method', () => {
		test('should return settings of connected memcached apps', async () => {
			const operationResult = await client.settings()
			expect(operationResult).toMatchObject([
				{
					server: memcachedClientConfig.server,
					maxbytes: expect.any(Number),
					maxconns: expect.any(Number),
					tcpport: expect.any(Number),
					udpport: expect.any(Number),
					inter: expect.any(String),
					verbosity: expect.any(Number),
					oldest: expect.any(Number),
					evictions: expect.any(String),
					domain_socket: expect.any(String),
					umask: expect.any(Number),
					growth_factor: expect.any(String),
					chunk_size: expect.any(Number),
					num_threads: expect.any(Number),
					num_threads_per_udp: expect.any(Number),
				},
			])
		})
	})

	describe('stats method', () => {
		test('should return stat info of connected memcached apps', async () => {
			const operationResult = await client.stats()
			expect(operationResult).toMatchObject([
				{
					server: memcachedClientConfig.server,
					pid: expect.any(Number),
					uptime: expect.any(Number),
					time: expect.any(Number),
				},
			])
		})
	})

	describe('slabs method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				callbackClient.set('test-2', 'test-value', 60, () => {
					done()
				})
			})
		})

		test('should retrieve info stats slab', async () => {
			const operationResult = await client.slabs()

			expect(operationResult).toMatchObject([
				{
					server: memcachedClientConfig.server,
					active_slabs: expect.any(Object),
					total_malloced: expect.any(Object),
				},
			])
		})
	})

	describe('items method', () => {
		beforeEach((done) => {
			callbackClient.set('test', 'test-value', 60, () => {
				callbackClient.set('test-2', 'test-value', 60, () => {
					done()
				})
			})
		})

		test('should retrieve info about stored objects', async () => {
			const operationResult = await client.items()

			expect(operationResult).toMatchObject([
				{
					'server': memcachedClientConfig.server,
					'1': {
						number: expect.any(Number),
						number_hot: expect.any(Number),
					},
				},
			])
		})
	})

	describe('flush method', () => {
		beforeEach((done) => {
			callbackClient.set('test-key-1', 'test-value', 60, () => {
				callbackClient.set('test-key-2', 'test-value', 60, () => {
					done()
				})
			})
		})

		test('should remove all values from cache using flush command', async () => {
			const operationResult = await client.flush()
			expect(operationResult).toEqual([true])

			return Promise.resolve((done) => {
				callbackClient.get('test-key-1', (_: unknown, dataByKey1: string | undefined) => {
					expect(dataByKey1).toBeUndefined()
					callbackClient.get('test-key-2', (__: unknown, dataByKey2: string | undefined) => {
						expect(dataByKey2).toBeUndefined()
						done()
					})
				})
			})
		})
	})
})
