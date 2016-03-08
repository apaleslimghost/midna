var find  = require('lodash.find');
var minBy = require('lodash.minby');
var maxBy = require('lodash.maxby');
var sortBy = require('lodash.sortby');
var hrtimeToNs = require('@quarterto/hrtime-to-ns');

function overlap(item1, item2) {
	var start1 = hrtimeToNs(item1.start);
	var end1   = hrtimeToNs(item1.end);
	var start2 = hrtimeToNs(item2.start);
	var end2   = hrtimeToNs(item2.end);

	return (start1 <= start2 && end1 >= start2)
	    || (start1 <= end2   && end1 >= end2)
	    || (start2 <= start1 && end2 >= start1)
	    || (start2 <= end1   && end2 >= end1);
}

function overlapAny(items, item) {
	return find(items, item2 => overlap(item, item2));
}

function findRow(rows, item) {
	return find(rows, row => (item.group ? row.group === item.group : row.tag === item.tag) && !overlapAny(row.items, item));
}

function insertItem(rows, item) {
	var row = findRow(rows, item);
	if(row) {
		row.items.push(item);
	} else {
		rows.push({tag: item.tag, group: item.group, items: [item]});
	}
	return rows;
}

module.exports = function(items) {
	var earliest = minBy(items, item => hrtimeToNs(item.start));
	var latest   = maxBy(items, item => hrtimeToNs(item.end));
	return {
		earliest, latest,
		rows: sortBy(items, item => hrtimeToNs(item.start)).reduce(insertItem, [])
	};
};
