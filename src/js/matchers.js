const cheerio = require('cheerio')

function isInteractive(content) {
	return content.tags && !!content.tags.find(function(tag) { return tag.id === 'type/interactive'; });
}

function categorizeElementInteractive($el) {

	var bootUrl = $el.attr('data-interactive');
	var canonicalUrl = $el.attr('data-canonical-url');
	var altText = $el.attr('data-alt');
	var type = (bootUrl.indexOf('iframe-wrapper') > -1 ) ? 'iframe' : 'bootjs';

	return {type: type, alt: altText, canonicalUrl: canonicalUrl, bootUrl: bootUrl};
}

exports.getTypes = function(content) {
	var types = []

	if (isInteractive(content)) types.push({type:'bootjs'});
	else if (content.fields.body) {
		var $ = cheerio.load(content.fields.body);
		var embedTypes = $('.element-interactive').each(function(i, el){
			var elType = categorizeElementInteractive($(el));
			types.push(elType);
		});
	}

	return types;
}
