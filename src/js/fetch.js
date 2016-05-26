import { fetch } from './fetcher'
import gu from 'koa-gu'

gu.init({www:false})

fetch()
	.then(() => {
		gu.log.info('done')
		gu.db.quit();
	})
	.catch(err =>
		gu.log.error(err.stack, () => process.exit(1))
	)
