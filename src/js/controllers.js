import gu from 'koa-gu'
import _ from 'lodash'
import moment from 'moment'
import { contentToTypeString, contentToGroups } from './fetcher'
import { getLatestRange } from './db'

exports.index = function *() {

    var startDate = moment().subtract(3, 'days');

    var items = yield getLatestRange(0, 200);
    var annotatedInteractives = _(items)
        .map(function(i) {
            i.message = contentToTypeString(i);
            i.types = contentToGroups(i);
            i.publicationTimeRelative = moment(i.webPublicationDate).fromNow();
            i.publicationTimeDisplay = moment(i.webPublicationDate).format('DD MMM HH:MM');
            return i;
        })
        .filter(function(i){
            return ( moment(i.webPublicationDate) >= startDate )? true : false;
        })
        .valueOf()

    this.body = gu.tmpl('../templates/index.html', { interactives: annotatedInteractives });
}

exports.json = function *() {
    var items = yield getLatestRange(0, 200);
    this.type = "application/json";
    this.body = JSON.stringify(items);
}
