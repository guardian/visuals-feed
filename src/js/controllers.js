import gu from 'koa-gu'
import _ from 'lodash'
import moment from 'moment'
import { contentToTypeString } from './fetcher'
import { getLatestRange } from './db'

exports.index = function *() {
	var items = yield getLatestRange(0, 50);
	var annotatedInteractives = _(items)
		.map(function(i) {
			i.message = contentToTypeString(i);
			i.publicationTimeRelative = moment(i.webPublicationDate).fromNow();
			i.publicationTimeDisplay = moment(i.webPublicationDate).format('DD MMM HH:MM');
			return i;
		}).valueOf()
    this.body = gu.tmpl('../templates/index.html', { interactives: annotatedInteractives });
}
