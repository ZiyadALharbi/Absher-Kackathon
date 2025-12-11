var ParentURL = "/wps/wcm/connect/individuals/",
    sorting = "desc";
sessionStorage.clear(), sessionStorage.sorting = !1;
var suggestionsLangURL = "en" == $("html").attr("lang") ? ParentURL + "69603eed-73ae-4934-b7a2-1698de9c2385/services_suggestation_data_en.js?MOD=AJPERES" : ParentURL + "54a41d40-59d7-4ade-8524-54c4794e9954/services_suggestation_data_ar.js?MOD=AJPERES",
    searchLangURL = "en" == $("html").attr("lang") ? ParentURL + "c535d58c-3130-4c56-b6cd-9eb60a4a909b/services_search_data_en.js?MOD=AJPERES" : ParentURL + "b887ccf7-8693-4f14-a6c5-03de371232f5/services_search_data_ar.js?MOD=AJPERES",
    suggestionslocalLangURL = "en" == $("html").attr("lang") ? "/portal/individuals/assets/migrated/services_suggestation_data_en.js?ver=18092024" : "/portal/individuals/assets/migrated/services_suggestation_data_ar.js?ver=18092024",
    searchlocalLangURL = "en" == $("html").attr("lang") ? "/portal/individuals/assets/migrated/services_search_data_en.js?ver=18092024" : "/portal/individuals/assets/migrated/services_search_data_ar.js?ver=18092024",
    suggestionsURL = $("html").hasClass("prod") ? suggestionsLangURL : suggestionslocalLangURL,
    searchURL = $("html").hasClass("prod") ? searchLangURL : searchlocalLangURL,
    pageLength = 10,
    options = {
        valueNames: ["name", "desc", "keywords"],
        page: pageLength,
        pagination: !0,
        item: function(e) {
            let s = `<li class="search-list__item" data-filter="${e.filters.split(",")}" >\n                    <a href="${e.url}">\n                        <span class="type">${e.type}</span>\n                        <span class="name">${e.name}</span>\n                        <span class="desc">${e.desc}</span>\n                        <span class="keywords hidden">${e.keywords}</span>\n                    </a>\n                </li>`;
            return e.url = "", s
        }
    },
    options1 = {
        valueNames: ["name", "desc", "keywords"],
        page: 5,
        pagination: !0
    },
    values = [],
    data = [];
"undefined" != typeof List && ($.getScript(suggestionsURL, (function(e) {
    try {
        suggetionsData.map((function(e) {
            $(".suggetionsBox ul").append("<li><a href='" + e.url + "'>" + e.name + "</a></li>")
        }))
    } catch (e) {}
})), $("#filterAccordion a[data-filter='*']").addClass("selected").hide(), $.getScript(searchURL, (function(e) {
    try {
        let e = JSON.stringify(servicesData);
        e = JSON.parse(e);
        let a = {},
            i = 0;
        for (k of e) k.url = "", Object.assign(a, {
            [i]: Object.assign(k)
        }), i++;
        var s = $("body").hasClass("rtl") ? "تم العثور على  " : "Results Found",
            t = $("body").hasClass("rtl") ? "من النتائج  " : "";
        userList = new List("searchBox", options, servicesData), userList.on("updated", (function(e) {
            $(".result_Found").text(s + " (" + e.matchingItems.length + ")" + t), e.matchingItems.length > 0 ? ($(".btn_Area").show(), e.matchingItems.length > pageLength ? $(".pagination").show() : $(".pagination").hide()) : $(".pagination").hide()
        }))
    } catch (e) {}
    $("#search-result-item").hide(), jq_bt(".searchlink").on("click", (function() {
        new bootstrap.Modal(document.getElementById("SearchModal")).show(), jq_bt("body").find(".modal-backdrop.show").addClass("search-backdrop"), $("#search1").focus()
    })), jq_bt(".orderlist").on("click", (function() {
        sessionStorage.sorting = !0, sorting = "asc" == sorting ? "desc" : "asc", userList.sort("name", {
            order: sorting
        })
    })), jq_bt(".close-suggetion").on("click", (function() {
        jq_bt("#SearchModal").modal("hide"), jq_bt(".modal-backdrop").remove()
    })), $(".search-modal").on("click", ".search-close-icon", (function() {
        $(".search-modal .searchTxt").val("").focus(), $(".search_autocomplete").addClass("hide"), $(".search-close-icon").remove(), $("#search-result-item").hide(), $("#search-sugetions-item").show()
    }))
}))), jq_bt(window).on("click", (function(e) {
    if (("filterSearch" == e.target.id || "list-group-item" == e.target.classList[0] || null == e.target.parentElement ? e.target.classList[0] : "panel-title" == e.target.parentElement.classList[0]) ? ($("#filterlist").addClass("clicked"), jq_bt("#filterSearch").show()) : (jq_bt("#filterSearch").hide(), $("#filterlist").removeClass("clicked")), "filterlist" == e.target.id) {
        document.querySelector("#filterSearch").style.display = "none" == sessionStorage.filterSE ? "none" : "block", "none" == sessionStorage.filterSE ? $elem("#filterlist").el[0].classList.remove("clicked") : $elem("#filterlist").el[0].classList.add("clicked")
    }(null == e.target.parentElement ? e.target.classList[0] : "searchTxt" == e.target.classList[0]) ? $elem(".search_autocomplete>ul li").el.length > 0 && jq_bt(".search_autocomplete").removeClass("hide"): jq_bt(".search_autocomplete").addClass("hide")
}));
const addDeleteTextBtn = (e, s) => {
        "" != e.target.value ? !1 === Boolean(s.parentElement.children[3].className) && s.parentElement.children.btnid.insertAdjacentHTML("beforebegin", '<i class="search-close-icon"></i>') : s.parentElement.children[3].remove()
    },
    addDeleteTextBtnSearch = (e, s) => {
        "" != e ? !1 === jq_bt("i").hasClass("search-close-icon") && $elem(".search_input>#btnid").el[0].insertAdjacentHTML("beforebegin", '<i class="search-close-icon"></i>') : $elem(".search_input>#btnid").el[0].remove()
    };
document.querySelector("#search1").value.length >= 1 && document.querySelector("#search1").parentElement.children.btnid.insertAdjacentHTML("beforebegin", '<i class="search-close-icon"></i>'), $("#search1").on("input", (function(e) {
    addDeleteTextBtn(e, this);
    var s = $(".search_autocomplete"),
        t = $(".search_autocomplete ul"),
        a = [],
        i = [],
        r = servicesData;
    let n, l, c, o;
    t.empty(), r.forEach(((e, s, r) => {
        n = this.value.toLowerCase().trim(), l = n.split(" "), c = e.name.toLowerCase(), o = c.split(" "), -1 != c.search(n) && o.forEach(((e, s, r) => {
            l.length > 0 ? l.forEach(((s, i, r) => {
                e.startsWith(s.trim()) && 0 == a.includes(e) && "" != s && (a.push(e), t.append(`<li class="acTermItem"><a href="javascript:void(0)" title="${e}">${e}</a></li>`))
            })) : e.startsWith(n.trim()) && 0 == a.includes(e) && (a.push(e), t.append(`<li class="acTermItem"><a href="javascript:void(0)" title="${e}">${e}</a></li>`)), 0 == i.includes(c) && (i.push(c), t.append(`<li class="acTermItem"><a href="javascript:void(0)" title="${c}">${c}</a></li>`))
        }))
    })), t.append("\n      <script>\n      jq_bt(\".acTermItem a\").on(\"click\",function(e){\n        addDeleteTextBtnSearch(this.attributes.title.value,this);\n        $('#search1').val(this.attributes.title.value); \n        $('#btnid').click();\n      })\n      <\/script>\n      "), a.length > 0 ? s.removeClass("hide") : s.addClass("hide")
}));
const newSearchText = () => {
    let e = "" !== $("#search1").val() && sessionStorage.advancedSearchtext == $("#search1").val();
    return sessionStorage.advancedSearchtext = $("#search1").val(), e
};
$("#btnid").on("click", (function(e) {
    if (handelSearch(), 0 == newSearchText()) {
        $(".list-group-item").removeClass("selected"), $(".panel-heading").removeClass("selected"), $("#filterSearch").css("display", "none"), $(".filterlist").removeClass("clicked"), userList.filter(), $(".search_autocomplete").addClass("hide"), userList.search($("#search1").val(), ["name", "desc", "keywords"]);
        let e = setTimeout((function() {
            clearTimeout(e), $("#search1").val().length > 0 ? ($("#search-result-item").show(), $("#search-sugetions-item").hide()) : ($("#search-result-item").hide(), $("#search-sugetions-item").show())
        }), 10);
        "true" == sessionStorage.sorting && userList.sort("name", {
            order: sorting
        })
    } else $("#search-result-item").show(), $("#search-sugetions-item").hide();
    for (i of $elem("div[role='tabpanel']").el) void 0 !== i.classList[2] && i.classList.remove("in");
    for (i of $elem(".panel-title a").el) i.attributes[4].value = !1
}));