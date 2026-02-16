// =========================
// Helpers
// =========================
function qs(id) { return document.getElementById(id); }

function unique(arr) {
  var out = [];
  for (var i = 0; i < arr.length; i++) {
    if (out.indexOf(arr[i]) === -1) out.push(arr[i]);
  }
  out.sort();
  return out;
}

function fillSelect(selectEl, values, allLabel) {
  selectEl.innerHTML = "";
  var opt0 = document.createElement("option");
  opt0.value = "";
  opt0.textContent = allLabel;
  selectEl.appendChild(opt0);

  for (var i = 0; i < values.length; i++) {
    var v = values[i];
    if (!v) continue;
    var opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}


//  JSON

function loadData(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "assets/data/dataset.json", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          var data = JSON.parse(xhr.responseText);
          callback(null, data);
        } catch (e) {
          callback(e, null);
        }
      } else {
        callback(new Error("Impossibile caricare dataset.json (status " + xhr.status + ")"), null);
      }
    }
  };
  xhr.send();
}

// CARDS
function renderCards(items) {
  var container = qs("results");
  if (!container) return;

  container.innerHTML = "";

  for (var i = 0; i < items.length; i++) {
    var o = items[i];

    var themeLabel = "";
    if (o.theme) themeLabel = o.theme;
    else if (o.themes && o.themes.length) themeLabel = o.themes[0];

    var century = o.century || "";
    var artist = o.artist || "";
    var title = o.title || "";
    var year = o.year || "";
    var technique = o.technique || "";
    var img = o.image || "";
    var id = o.id || "";

    var article = document.createElement("article");
    article.className = "work-card"; // <- para que use tu CSS

    article.innerHTML =
      '<div class="image-box">' +
        '<img src="' + img + '" alt="' + title + ' di ' + artist + '">' +
      '</div>' +
      '<div class="content">' +
        '<div class="title">' + title + '</div>' +
        '<div class="meta"><strong>' + artist + '</strong>' + (year ? ' — ' + year : '') + '</div>' +
        (technique ? '<div class="small muted">' + technique + '</div>' : '') +
        '<div class="tags">' +
          (century ? '<span class="tag">' + century + '</span>' : '') +
          (themeLabel ? '<span class="tag">' + themeLabel + '</span>' : '') +
        '</div>' +
        '<div class="actions">' +
          '<a href="item.html?id=' + encodeURIComponent(id) + '">Scheda opera</a>' +
        '</div>' +
      '</div>';

    container.appendChild(article);
  }

  var countEl = qs("count");
  if (countEl) {
    countEl.textContent = (items.length === 1) ? "1 risultato" : (items.length + " risultati");
  }
}


// FILTRI

var DATASET = [];

function applyFilters() {
  var century = qs("fCentury") ? qs("fCentury").value : "";
  var artist = qs("fArtist") ? qs("fArtist").value : "";
  var technique = qs("fTechnique") ? qs("fTechnique").value : "";
  var theme = qs("fTheme") ? qs("fTheme").value : "";
  var q = qs("q") ? (qs("q").value || "").toLowerCase() : "";

  var filtered = [];
  for (var i = 0; i < DATASET.length; i++) {
    var o = DATASET[i];

    var okCentury = (!century) || (o.century === century);
    var okArtist = (!artist) || (o.artist === artist);
    var okTech = (!technique) || (o.technique === technique);

    var okTheme = true;
    if (theme) {
      okTheme = false;
      if (o.theme && o.theme === theme) okTheme = true;
      if (o.themes && o.themes.indexOf(theme) !== -1) okTheme = true;
    }

    var okQ = true;
    if (q) {
      var hay = ((o.title || "") + " " + (o.artist || "") + " " + (o.technique || "")).toLowerCase();
      okQ = (hay.indexOf(q) !== -1);
    }

    if (okCentury && okArtist && okTech && okTheme && okQ) {
      filtered.push(o);
    }
  }

  renderCards(filtered);
}


function initCollection() {
  loadData(function (err, data) {
    if (err) {
      console.error(err);
      var countEl = qs("count");
      if (countEl) countEl.textContent = "Errore nel caricamento dati";
      return;
    }

    DATASET = data;

    var centuries = unique(data.map(function(o){ return o.century; }));
    var artists   = unique(data.map(function(o){ return o.artist; }));
    var techniques= unique(data.map(function(o){ return o.technique; }));

    var themesAll = [];
    for (var i = 0; i < data.length; i++) {
      if (data[i].themes && data[i].themes.length) {
        for (var j = 0; j < data[i].themes.length; j++) themesAll.push(data[i].themes[j]);
      }
      if (data[i].theme) themesAll.push(data[i].theme);
    }
    var themes = unique(themesAll);

    if (qs("fCentury")) fillSelect(qs("fCentury"), centuries, "Tutti");
    if (qs("fArtist")) fillSelect(qs("fArtist"), artists, "Tutte");
    if (qs("fTechnique")) fillSelect(qs("fTechnique"), techniques, "Tutte");
    if (qs("fTheme")) fillSelect(qs("fTheme"), themes, "Tutti");

    if (qs("fCentury")) qs("fCentury").addEventListener("change", applyFilters);
    if (qs("fArtist")) qs("fArtist").addEventListener("change", applyFilters);
    if (qs("fTechnique")) qs("fTechnique").addEventListener("change", applyFilters);
    if (qs("fTheme")) qs("fTheme").addEventListener("change", applyFilters);
    if (qs("q")) qs("q").addEventListener("input", applyFilters);

    if (qs("reset")) {
      qs("reset").addEventListener("click", function () {
        if (qs("fCentury")) qs("fCentury").value = "";
        if (qs("fArtist")) qs("fArtist").value = "";
        if (qs("fTechnique")) qs("fTechnique").value = "";
        if (qs("fTheme")) qs("fTheme").value = "";
        if (qs("q")) qs("q").value = "";
        applyFilters();
      });
    }

    applyFilters();
  });
}

// =========================
// Init item (con screenshot posizione se lo aggiungi nel JSON)
// =========================
function initItem() {
  var params = new URLSearchParams(window.location.search);
  var id = params.get("id");

  loadData(function (err, data) {
    if (err) { console.error(err); return; }

    var obj = null;
    for (var i = 0; i < data.length; i++) {
      if (data[i].id === id) { obj = data[i]; break; }
    }

    var container = qs("item");
    if (!container) return;

    if (!obj) {
      container.innerHTML = "<p>Opera non trovata.</p>";
      return;
    }

    var crumb = qs("crumbTitle");
    if (crumb) crumb.textContent = obj.title;

    var themesStr = "";
    if (obj.theme) themesStr = obj.theme;
    else if (obj.themes && obj.themes.length) themesStr = obj.themes.join(", ");

    container.innerHTML =
      "<div class='item-wrap'>" +

        "<h1>" + (obj.title || "") + "</h1>" +
        "<p class='muted'><strong>" + (obj.artist || "") + "</strong>" +
        (obj.year ? " — " + obj.year : "") + "</p>" +

        /* IMG */
        "<div class='item-main-image'>" +
          "<img src='" + (obj.image || "") + "' alt='" + (obj.title || "") + "'>" +
        "</div>" +

        /* METADATI */
        "<section class='panel' style='margin-top:20px;'>" +
          "<h3>Metadati dell’opera</h3>" +
          "<ul>" +
            "<li><strong>Data:</strong> " + (obj.year || "") + "</li>" +
            "<li><strong>Secolo:</strong> " + (obj.century || "") + "</li>" +
            "<li><strong>Tecnica:</strong> " + (obj.technique || "") + "</li>" +
            "<li><strong>Tema:</strong> " + (themesStr || "") + "</li>" +
          "</ul>" +
        "</section>" +

        /* DESCRIZIONE */
        "<section class='panel' style='margin-top:20px;'>" +
          "<h3>Descrizione storico-artistica</h3>" +
          "<p>" + (obj.description || "") + "</p>" +
        "</section>" +

        /* DOVE SI TROVA */
        "<section class='panel' style='margin-top:20px;'>" +
          "<h3>Dove si trova l’opera</h3>" +
          "<p class='muted'>" + (obj.current_location || "") + "</p>" +
          (obj.location_screenshot ?
            "<div class='item-location-image'>" +
              "<img src='" + obj.location_screenshot + "' alt='Posizione dell’opera'>" +
            "</div>"
          : "") +
        "</section>" +

        /* FONTI */
        "<section class='panel' style='margin-top:20px;'>" +
          "<h3>Fonti e diritti</h3>" +
          "<p><strong>Fonte:</strong> " + (obj.imageCredit || "") + "</p>" +
          "<p><strong>Diritti:</strong> " + (obj.rights || "") + "</p>" +
        "</section>" +

        "<p style='margin-top:20px;'>" +
          "<a href='collection.html'>← Torna alla collezione</a>" +
        "</p>" +

      "</div>";
  });
}