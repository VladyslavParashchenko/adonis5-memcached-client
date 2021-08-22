import memcachedClientConfig from './fixtures/client-config'
import AdonisMemcachedClientProvider from '../providers/AdonisMemcachedClientProvider'
import { mocked } from 'ts-jest/utils'
import buildClient from '../src/buildClient'
import AdonisApplication from 'adonis-provider-tester'

jest.mock('../src/buildClient', () => {
	return jest.fn()
})
describe('Adonis memcached client provider test', () => {
	let app: AdonisApplication
	let closeMock = <jest.MockedFunction<() => Promise<void>>>jest.fn()

	beforeEach(async () => {
		jest.clearAllMocks()
		app = await new AdonisApplication()
			.registerProvider(AdonisMemcachedClientProvider)
			.registerAppConfig({ configName: 'memcached', appConfig: memcachedClientConfig })
			.loadApp()

		mocked(buildClient).mockImplementation(() => {
			return {
				end: closeMock,
			} as any
		})
	})

	describe('test provider registration', () => {
		test('should call client builder with correct config', async () => {
			app.iocContainer.use('Adonis/Addons/Adonis5-MemcachedClient')
			expect(buildClient).toHaveBeenNthCalledWith(1, memcachedClientConfig)
		})

		afterEach(async () => {
			await app.stopApp()
		})
	})

	describe('test provider shutdown', () => {
		test('should close connection on application shutdown', async () => {
			await app.stopApp()
			expect(closeMock).toBeCalledTimes(1)
		})
	})
})
