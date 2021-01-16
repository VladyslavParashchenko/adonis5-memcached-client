declare module '@ioc:Adonis/Core/Application' {
	import { AdonisMemcachedClientContract } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'

	export interface ContainerBindings {
		'Adonis/Addons/Adonis5-MemcachedClient': AdonisMemcachedClientContract
	}
}
