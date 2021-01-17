import { ConfigContract } from '@ioc:Adonis/Core/Config'
import buildClient from '../src/buildClient'
import { AdonisMemcachedClientContract } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'
import { IocContract } from '@adonisjs/fold'

export default class AdonisMemcachedClientProvider {
	constructor(protected container: IocContract) {}

	public register(): void {
		this.container.singleton('Adonis/Addons/Adonis5-MemcachedClient', () => {
			const config: ConfigContract = this.container.use('Adonis/Core/Config')
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
		const client: AdonisMemcachedClientContract = this.container.use(
			'Adonis/Addons/Adonis5-MemcachedClient'
		)
		if (client) {
			await client.end()
		}
	}
}
