var prettyColorGen = require('@quarterto/pretty-color-gen');
var hrtimeToNs = require('@quarterto/hrtime-to-ns');
var contrast = require('contrast');
var entities = require('entities');

function textColor(bg) {
	return contrast(bg) === 'light' ? '#000' : '#fff';
}

function drawItem(item, options) {
	var color = prettyColorGen(item.tag);
	var x = hrtimeToNs(item.start)/options.scale - options.offset;
	var width = hrtimeToNs(item.length) / options.scale;
	var label = entities.encodeXML(`${item.tag}${item.group ? `(${item.group})` : ''} - ${(hrtimeToNs(item.length) / 1e6).toFixed(2)}ms - ${item.label}`);
	var id = Math.random().toString().slice(2);

	return `<g transform="translate(${x})">
<defs>
<path id="path-${id}" d="M0,15 L${width - 5},15" fill="none" stroke="none"/>
</defs>
<rect width="${width}" height="20" fill="${color}" />
<text font-family="BentonSans, sans-serif" y="10" alignment-baseline="central" fill="${textColor(color)}">
<title>${label}</title>
<textPath xlink:href="#path-${id}">${label}</textPath>
</text>
</g>`;
}

function drawRow(row, options) {
	return `<g transform="translate(0 ${options.y})">${row.items.map(item => drawItem(item, options)).join('\n')}</g>`;
}

function drawRows(rows, options) {
	return rows.map((row, i) => drawRow(row, Object.assign({y: i * 25}, options))).join('\n');
}

module.exports = function draw(chart) {
	var height = chart.rows.length * 25 - 5;
	var start = hrtimeToNs(chart.earliest.start);
	var end   = hrtimeToNs(chart.latest.end);
	var width = 2000;
	var scale = (end - start) / width;
	var offset = start / scale;
	var options = {scale, offset};

	return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewbox="0 0 ${width} ${height}">${drawRows(chart.rows, options)}</svg>`;
}
