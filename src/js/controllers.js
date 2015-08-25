import gu from 'koa-gu'
import _ from 'lodash'
import moment from 'moment'
import { contentToTypeString } from './fetcher'

exports.index = function *() {
    this.body = gu.tmpl('../templates/index.html', {  });
    const interactives = (yield gu.db.getObj('gu.interactives')) || [];
	var annotatedInteractives = _(interactives)
		.sort(function(a,b) { return new Date(a.webPublicationDate) - new Date(b.webPublicationDate); })
		.reverse()
		.slice(0, 10)
		.map(function(i) {
			i.message = contentToTypeString(i);
			i.publicationTimeRelative = moment(i.webPublicationDate).fromNow();
			i.publicationTimeDisplay = moment(i.webPublicationDate).format('DD MMM HH:MM');
			return i;
		}).valueOf()

    this.body = gu.tmpl('../templates/index.html', { interactives: annotatedInteractives });

}
