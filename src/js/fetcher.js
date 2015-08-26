import fs from 'fs'
import rp from 'request-promise'
import querystring from 'querystring'
import util from 'util'
import moment from 'moment'
import matchers from './matchers'
import _ from 'lodash'
import gu from 'koa-gu'
import { saveContent, getMultiple } from './db'

export function transformContent(content) {
    return {
        id: content.id,
        webPublicationDate: content.webPublicationDate,
        findDate: (new Date()).toISOString(),
        headline: content.fields.headline,
        url: content.webUrl,
        types: matchers.getTypes(content)
    }
}

function* capi(params) {
    var body;
    try {
        var capi_uri = 'http://content.guardianapis.com/search?' + querystring.stringify(params);
        gu.log.debug(`Requesting ${capi_uri}`)
        body = yield rp({
            uri: capi_uri,
            transform: function(body, response) {
			    return response.headers['content-type'].indexOf('application/json') === 0 ?
			        JSON.parse(body) : body;
			}
        });
    } catch (err) {
        gu.log.error('Error making CAPI request');
        gu.log.error(err.stack)
        process.exit(1);
    }

    return body.response.results;
}

export function contentToTypeString(content) {
    if (content.types.length === 1) {
        var type = content.types[0];
        return type.type + (type.alt ? ' (' + type.alt  +')' : '');
    } else {
        return _(content.types)
            .groupBy('type').mapValues('length')
            .map(function(val, key) { return util.format("%d x %s", val, key); })
            .valueOf()
            .join(', ')
    }
}

function contentToMessage(content) {
    var typeStr = contentToTypeString(content);
    return util.format("%s: <%s|%s>", typeStr, content.url, content.headline);
}

function msgToSlackPromise(msg) {
    return gu.config.slackWebHook ? rp({
        uri: gu.config.slackWebHook,
        method: 'POST',
        body: JSON.stringify({
            channel: gu.config.channel,
            text: msg
        })
    }) : null;
}

export function* fetch() {

    var searchParams = [
        { // search newly published articles
            'order-by': 'newest',
            'use-date': 'published',
            'show-fields': 'all',
            'page-size': 50,
            'show-tags': 'type',
            'tag': 'type/article',
            'from-date': moment().subtract(2, 'days').format('YYYY-MM-DD'),
            'api-key': gu.config.capi_key
        }, { // search updated live blogs
            'order-by': 'newest',
            'use-date': 'last-modified',
            'show-fields': 'all',
            'page-size': 50,
            'show-tags': 'type',
            'tag': 'tone/minutebyminute',
            'from-date': moment().subtract(2, 'days').format('YYYY-MM-DD'),
            'api-key': gu.config.capi_key
        },{ // search interactives
            'order-by': 'newest',
            'use-date': 'published',
            'show-fields': 'all',
            'page-size': 50,
            'show-tags': 'type',
            'tag': 'type/interactive',
            'from-date': moment().subtract(2, 'days').format('YYYY-MM-DD'),
            'api-key': gu.config.capi_key
        }]

    var newAndUpdated = [];
    var searchPromises = searchParams.map(params => capi(params));
    var resultArrays = yield searchPromises;
    var allResults = [].concat.apply([], resultArrays)
    var uniqResults = _.uniq(allResults, r => r.id)
    var visualsItems = uniqResults.map(transformContent).filter(content => content.types.length)

    var existingItems = yield getMultiple(visualsItems.map(r => r.id))
    var newAndUpdated = visualsItems.filter((visualsItem, i) =>
        existingItems[i] === null || _.xor(_.pluck(visualsItem.types, 'type'),
                                       _.pluck(existingItems[i].types, 'type')).length
    )

    if (newAndUpdated.length) {
        gu.log.info(`${newAndUpdated.length} new/updated interactives`);
        yield newAndUpdated.map(saveContent);
        var messages = newAndUpdated.map(contentToMessage)
        messages.forEach(gu.log.info.bind(gu.log))
        var slackPromises = messages.map(msgToSlackPromise)
        try {
            yield slackPromises;
        } catch (err) {
            gu.log.error('Error posting to slack');
            gu.log.error(err.stack);
            process.exit(1);
        }
    } else {
        gu.log.info('No new interactives');
    }
}
