import { ConfigContract } from '@ioc:Adonis/Core/Config'
import buildClient from '../src/buildClient'
import { AdonisMemcachedClientContract } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'
import { Application } from '@adonisjs/application'
import { IocContract } from '@adonisjs/fold'
import { ContainerBindings } from '@ioc:Adonis/Core/Application'

export default class AdonisMemcachedClientProvider {
	public static needsApplication: true
	private container: IocContract<ContainerBindings>

	constructor({ container }: Application) {
		this.container = container
	}

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
