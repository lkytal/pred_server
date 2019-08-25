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
		head += mzs[i].toFixed(2) + '\t' + its[i].toFixed(5) + '\n';
	}

	return head + 'END IONS';
}

let types = { 2: 'ETD', 3: 'HCD' };

function show_result(data, type, charge, peptide) {
	let [mass, mzs, its] = data;

	$('#mgf_box').html(mgf(type, charge, peptide, mass, mzs, its));

	$('#rst').html('<div id="sp"></div>');

	Plotly.newPlot('sp', [
		{
			x: mzs,
			y: its,
			type: 'bar'
		}
	],
	{
		title: {
			text: `Prediction of ${peptide}, charge ${charge}+, ${types[type]}`
		},
		xaxis: {
			range: [130, mzs[mzs.length - 1] + 50],
			title: { text: 'M/z' }
		}
	});
}

function get(type, charge, peptide) {
	// console.log(type, charge, peptide)

	jQuery.getJSON(`/json/${type}/${charge}/${peptide}?id=${(new Date()).valueOf()}`, function (data) {
		$('#loadding').slideUp(400);
		$('#info').slideDown(400);
		$('#plot').slideDown(400);
		$('#mgf').slideDown(400);

		setTimeout(function () {
			$('#info').slideUp(400);
		}, 1500);


		$('body, html').animate({
			scrollTop: $('#info')[0].offsetTop - 300
		}, 1000);

		show_result(data, type, charge, peptide);

	}).fail(function (rqt) {
		$('#loadding').slideUp(400);
		$('#loadErr').slideDown(400);
	});
}

let charMap = {
	"A": 1, "R": 2, "N": 3, "D": 3, "C": 5, "E": 5, "Q": 7,
	"G": 8, "H": 9, "I": 10, "L": 11, "K": 12, "M": 13, "F": 14,
	"P": 15, "S": 16, "T": 17, "W": 18, "Y": 19, "V": 20
};

function invalid(pep) {
	pep = pep.toUpperCase();

	if (pep.length > 22) return true;

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
