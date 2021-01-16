import { ConfigContract } from '@ioc:Adonis/Core/Config'
import { ApplicationContract } from '@ioc:Adonis/Core/Application'
import buildClient from '../src/buildClient'
import { AdonisMemcachedClientContract } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'

export default class AdonisMemcachedClientProvider {
	constructor(protected app: ApplicationContract) {}

	public register(): void {
		this.app.container.singleton('Adonis/Addons/Adonis5-MemcachedClient', () => {
			const config: ConfigContract = this.app.container.use('Adonis/Core/Config')
			return buildClient(config.get('memcached'))
		})
	}

	public async boot() {
		// All bindings are ready, feel free to use them
	}

	public async ready() {
		// App is ready
	}

	public async shutdown() {
		const client: AdonisMemcachedClientContract = this.app.container.use(
			'Adonis/Addons/Adonis5-MemcachedClient'
		)
		if (client) {
			await client.end()
		}
	}
}
