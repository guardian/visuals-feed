const cheerio = require('cheerio')

function isInteractive(content) {
	return content.tags && !!content.tags.find(function(tag) { return tag.id === 'type/interactive'; });
}

function categorizeElementInteractive($el) {

	var bootUrl = $el.attr('data-interactive');
	var canonicalUrl = $el.attr('data-canonical-url');
	var altText = $el.attr('data-alt');

	if (bootUrl === 'http://open-module.appspot.com/boot.js') {
		return { type:'Open module', alt: altText };
	}
	else if (bootUrl === 'http://interactive.guim.co.uk/embed/iframe-wrapper/0.1/boot.js') {

		if (canonicalUrl.indexOf('http://interactive.guim.co.uk/visuals-blank-page/guardian-poll-projections') === 0) {
			return {type: 'Poll Projection', alt: altText};
		} else if (canonicalUrl.indexOf('http://interactive.guim.co.uk/embed/2015/03/climate-embeds/campaign-form') === 0) {
			return {type: 'Climate Petition', alt: altText};
		}

		return {type: 'iframe', alt: altText}
	}

	return {type: 'Embed', alt: altText};
}

exports.getTypes = function(content) {
	var types = []

	if (isInteractive(content)) types.push({type:'Interactive'});
	else if (content.fields.body) {
		var $ = cheerio.load(content.fields.body);
		var embedTypes = $('.element-interactive').each(function(i, el){
			var elType = categorizeElementInteractive($(el));
			types.push(elType);
		});
	}

	return types;
}
