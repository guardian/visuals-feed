import gu from 'koa-gu'
import moment from 'moment'

function idToKey(id) { return `feed:${id}`; }

export async function getLatestRange(start = 0, end = 100) {
	var ids = await gu.db.zrevrange('feed', start, end);
	return await getMultiple(ids);
}

export async function getMultiple(ids) {
	var keys = ids.map(idToKey)
	var strs = await gu.db.mget.call(gu.db, keys);
	return strs.map(JSON.parse);
}


export async function saveContent(content) {
	await gu.db.set(idToKey(content.id), JSON.stringify(content))
	var len = await gu.db.zadd('feed', Date.parse(content.webPublicationDate), content.id)
	console.log('zadd', len);
}
