import dotenv from 'dotenv'
import { AdonisMemcachedClientConfig } from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'

dotenv.config()

const config: AdonisMemcachedClientConfig = {
	server: `localhost:${process.env.MEMCACHED_PORT}`,
}

export default config
