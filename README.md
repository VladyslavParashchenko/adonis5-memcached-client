# Adonis5-Memcached-Client

> Memcached client for AdonisJS 5

[![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

Based on [Memcached](https://www.npmjs.com/package/memcached) and promisified for better developer experience.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Installation](#installation)
- [Sample Usage](#sample-usage)
- [Client api](#client-api)
  - [get](#get)
  - [touch](#touch)
  - [gets](#gets)
  - [getMulti](#getmulti)
  - [set](#set)
  - [replace](#replace)
  - [add](#add)
  - [cas](#cas)
  - [append](#append)
  - [prepend](#prepend)
  - [incr](#incr)
  - [decr](#decr)
  - [del](#del)
  - [version](#version)
  - [flush](#flush)
  - [stats](#stats)
  - [settings](#settings)
  - [slabs](#slabs)
  - [items](#items)
  - [end](#end)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Installation

```bash
npm i adonis5-memcached-client
```

Install provider:

```bash
node ace invoke adonis5-memcached-client
```

* For other configuration, please update the `config/memcached.ts`.

# Sample Usage

Import client from Adonis IoC and use it for getting access to the cache:

```js
 import MemcachedClient from '@ioc:Adonis/Addons/Adonis5-MemcachedClient'

export default class CacheRepository {
	constructor() {
	}

	public async find<T>(key): Promise<T | undefined> {
		return MemcachedClient.get < T > (key)
	}
}
```

# Client api

## get

Get the value for the given key.

```js
const value = await client.get('key');
```

* `key`: **String**, the key

## touch

Touches the given key.

```js
await client.touch('key', 10);
```

* `key`: **String** The key
* `lifetime`: **Number** After how long should the key expire measured in `seconds`

## gets

Get the value and the CAS id.

```js
const { key, cas } = await client.gets('key', 10);
```

* `key`: **String**, the key

## getMulti

Retrieves a bunch of values from multiple keys.

```js
const values = await client.getMulti(['key-1', 'key-2']);
```

* `keys`: **String[]**, all the keys that needs to be fetched

## set

Stores a new value in Memcached.

```js
const result = await client.set('foo', 'bar', 10);
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`

## replace

Replaces the value in memcached.

```js
const result = await client.replace('foo', 'bar', 10);
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`

## add

Add the value, only if it's not in memcached already.

```js
const result = await client.add('test-key', 'test-value', 60);
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`

## cas

Add the value, only if it matches the given CAS value.

```js
const result = await client.cas('test', 'new-value', cas, 100);
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.
* `lifetime`: **Number**, how long the data needs to be replaced measured in `seconds`
* `cas`: **String** the CAS value

## append

Add the given value string to the value of an existing item.

```js
await client.append('test', '-postfix')
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.

## prepend

Add the given value string to the value of an existing item.

```js
const result = await client.prepend('test', 'prefix-')
```

* `key`: **String** the name of the key
* `value`: **Mixed** Either a buffer, JSON, number or string that you want to store.

## incr

Increment a given key.

```js
const result = await client.incr('test', 100)
```

* `key`: **String** the name of the key
* `amount`: **Number** The increment

## decr

Decrement a given key.

```js
const result = await client.decr('test', 100)
```

* `key`: **String** the name of the key
* `amount`: **Number** The decrement

## del

Remove the key from memcached.

```js
const result = await client.del('test')
```

* `key`: **String** the name of the key

## version

Retrieves the version number of your server.

```js
const versionInfo = await client.version()
```

## flush

Flushes the memcached server.

```js
const results = await client.flush()
```

## stats

Retrieves stats from your memcached server.

```js
const statsInfo = await client.stats()
```

## settings

Retrieves your `settings` for connected servers.

```js
const settings = await client.settings()
```

## slabs

Retrieves `slabs` information for connected servers.

```js
const slabsInfo = await client.slabs()
```

## items

Retrieves `items` information for connected servers.

```js
const items = await client.items()
```

## end

Closes all active memcached connections.

```js
await client.end()
```

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript

[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/adonis5-memcached-client.svg?style=for-the-badge&logo=npm

[npm-url]: https://npmjs.org/package/adonis5-memcached-client "npm"

[license-image]: https://img.shields.io/npm/l/adonis5-memcached-client?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
