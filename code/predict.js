function init() {
	$('#info, #loadding, #loadErr, #invalid, #plot, #mgf').removeClass('hidden').slideUp(0);

	//Custom Selects
	$("select").select2({
		dropdownCssClass: 'dropdown-inverse'
	});
	$('.input-group').on('focus', '.form-control', function () {
		return $(this).closest('.input-group, .form-group').addClass('focus');
	}).on('blur', '.form-control', function () {
		return $(this).closest('.input-group, .form-group').removeClass('focus');
	});
	$(".btn-group").on('click', "a", function () {
		return $(this).siblings().removeClass("active").end().addClass("active");
	});
}

function mgf(type, charge, pep, mass, mzs, its) {
	let head = `BEGIN IONS\nTitle=${pep}\nCHARGE=${charge}+\nPEPMASS=${mass}\n`;

	for (let i = 0; i < mzs.length; i++) {
		head += mzs[i].toFixed(2) + '\t' + Math.pow(its[i], 2).toFixed(5) + '\n';
	}

	return head + 'END IONS';
}

let types = { 2: 'ETD', 3: 'HCD' };

function show_result(data, type, charge, peptide) {
	let [mass, mzs, its] = data;

	$('#mgf_box').html(mgf(type, charge, peptide, mass, mzs, its));

	$('#rst').html('<div id="sp"></div>');

	// for (let i = 0; i < its.length; ++i) {
	// 	its[i] = Math.pow(its[i], 2);
	// }

	Plotly.newPlot('sp', [
		{
			x: mzs,
			y: its,
			type: 'bar'
		}
	],
	{
		title: {
			text: `Prediction of ${peptide}, charge ${charge}+, ${types[type]}, intensities showed by square root!!!`
		},
		xaxis: {
			range: [0, mzs[mzs.length - 1] + 50],
			title: { text: 'M/z' }
		}
	});
}

function get(type, charge, peptide) {
	// console.log(type, charge, peptide)

	jQuery.getJSON(`/json/${type}/${charge}/${peptide}?id=${(new Date()).valueOf()}`, function (data) {
		$('#loadding').slideUp(400);
		$('#loadErr').slideUp(400);
		$('#info').slideDown(400);
		$('#plot').slideDown(400);
		$('#mgf').slideDown(400);

		// setTimeout(function () {
		// 	$('#info').slideUp(400);
		// }, 1500);

		$('body, html').animate({
			scrollTop: $('#info')[0].offsetTop - 200
		}, 1000);

		show_result(data, type, charge, peptide);

	}).fail(function (rqt) {
		$('#loadding').slideUp(400);
		$('#loadErr').slideDown(400);
	});
}

let charMap = {
	'@': 0, '[': 21, 'A': 1, 'C': 2, 'D': 3, 'E': 4, 'F': 5, 'G': 6, 'H': 7,
	'I': 8, 'K': 9, 'L': 10, 'M': 11, 'N': 12, 'P': 13, 'Q': 14, 'R': 15,
	'S': 16, 'T': 17, 'V': 18, 'W': 19, 'Y': 20
}

function invalid(pep) {
	pep = pep.toUpperCase();

	if (pep.length > 30) return true;

	for (let c of pep) {
		if (!charMap.hasOwnProperty(c)) return true;
	}

	return false;
}

function doSearch() {
	if (invalid($('#peptide').val())) {
		$('#info').slideUp(400);
		$('#loadding').slideUp(400);
		$('#loadErr').slideUp(400);

		$('#invalid').slideDown(400);

		return;
	}

	$('#info').slideUp(400);
	$('#loadErr').slideUp(400);
	$('#invalid').slideUp(400);
	$('#plot').slideUp(400);
	$('#mgf').slideUp(400);

	$('#loadding').slideDown(400);
	get($('#type').val(), $('#charge').val(), $('#peptide').val().toUpperCase());
}

init();

$('#search').on('click', function (event) {
	return doSearch();
});

$('#peptide').focus().on('keydown', function (event) {
	if (event.which === 13) {
		return doSearch();
	}
});
