import { fetch } from './fetcher'
import co from 'co'
import gu from 'koa-gu'

gu.init({www:false})

co(fetch)
	.then(_ => {
		gu.log.info('done')
		gu.db.quit();
	})
	.catch(err =>
		gu.log.error(err.stack, _ => process.exit(1))
	)
