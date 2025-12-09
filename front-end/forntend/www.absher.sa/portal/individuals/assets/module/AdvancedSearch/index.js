localLangData = params[1][Object.keys(params[1])[1]][langc][0];
$elem("#" + id).html(mainTemplate(localLangData));
fileload(filePath + "script.js", "js");

let selectedVal = [];
let inResults, filterOptions;
let filters = JSON.parse(
    '{"byType": "", "bySector": "", "byCommunityMember": ""}'
);

$elem("#filterlist").on("click", function() {

    let advancedSearchBox = document.querySelector("#filterSearch");
    sessionStorage.filterSE = advancedSearchBox.style.display;
    advancedSearchBox.style.display =
        sessionStorage.filterSE == "none" || sessionStorage.filterSE == "" ?
        "block" :
        "none";
    sessionStorage.filterSE == "none" || sessionStorage.filterSE == "" ?
        $elem("#" + this.id).el[0].classList.add("clicked") :
        $elem("#" + this.id).el[0].classList.remove("clicked");
    sessionStorage.filterSE = advancedSearchBox.style.display;
});
$elem(".orderlist").on("click", function() {
    $elem(".orderlist").toggleClass("clicked");
});

$elem("#filterlist").afterend(advancedFilterTemplate(searchStyle));
for (let i of params[1][Object.keys(params[1])[0]][langc]) {
    $elem("#filterAccordion")
        .appendElement("div")
        .prop({
            id: "panel" + i.id,
            class: "panel panel-default"
        });
    $elem("#panel" + i.id).html(advanceFilterPanelTemplate(i));
    for (let j of i.childLink) {
        $elem("#" + i.id + "btnList")
            .appendElement("a")
            .prop({
                id: j.id,
                type: "button",
                class: "list-group-item text-left"
            });
        $elem("#" + j.id).attr("data-filter", j.datafilter);
        $elem("#" + j.id).html(j.name);

        $elem("#" + j.id).on("click", function(e) {
            //new code
            $(this).siblings().removeClass("selected");

            if ($(this).hasClass("selected")) {
                filters[$(this).parent().parent().siblings().attr("id")] = "";
                //$(this).parent().parent().parent().parent().find('.panel-heading.selected').removeClass("selected");
            } else {
                filters[$(this).parent().parent().siblings().attr("id")] =
                    $(this).attr("data-filter");
            }

            if (selectedVal.length == 1 && selectedVal[0] == "*") selectedVal = [];
            //new code end

            let reClick = this.classList.value.search("selected") > 0 ? true : false;
            let reClickVal =
                this.classList.value.search("selected") > 0 ? this.text : "";

            // Boolean(document.querySelectorAll("#filterSearch .selected")[0])?document.querySelectorAll("#filterSearch .selected")[0].classList.value.search("selected")>=0?document.querySelectorAll("#filterSearch .selected")[0].classList.remove("selected","selected"):'':'';

            e.currentTarget.classList.add("selected", "selected");
            e.currentTarget.parentNode.parentNode.parentNode.children[0].classList.add(
                "selected",
                "selected"
            );
            let matchValue;

            if (reClick != true) {
                if (this.dataset.filter == "*") {
                    document.querySelectorAll("a.selected").forEach((i, v, a) => {
                        i.classList.remove("selected");
                    });
                    e.currentTarget.classList.remove("selected", "selected");
                    e.currentTarget.parentNode.parentNode.parentNode.children[0].classList.remove(
                        "selected",
                        "selected"
                    );
                    selectedVal = ["*"];
                } else {
                    selectedVal.push(this.dataset.filter);
                    selectedVal = [...new Set(selectedVal)];
                }
            } else {
                e.currentTarget.parentNode.parentNode.parentNode.children[0].classList.remove(
                    "selected",
                    "selected"
                );
                e.currentTarget.classList.remove("selected", "selected");
                selectedVal = selectedVal.filter((item) => {
                    return item !== this.dataset.filter;
                });
            }

            //new code
            // sinle filter in each category
            selectedVal = [];
            for (var f in filters) {
                if (filters[f] != "") selectedVal.push([filters[f]]);
            }

            if (selectedVal.length == 0) selectedVal = ["*"];
            //new code end
            if (selectedVal == "*") {
                userList.filter(function(item) {
                    return true;
                });
                if (sessionStorage.sorting == "true")
                    userList.sort("name", {
                        order: sorting
                    });
            } else {
                userList.filter(function(item) {
                    //new code
                    inResults = false;
                    filterOptions = item.values().filters.split(",");
                    //new code end
                    for (let l of selectedVal) {
                        //new code
                        inResults = filterOptions.includes(l.toString());
                        if (inResults == false) break;
                        else continue;
                        //new code end
                        /*
                        for(let k of item.values().tabList){ 
                        if(k[Object.keys(k)]) 
                        for(j of k[Object.keys(k)].split(",")){
                        if(j==l)
                        return true
                        else 
                        false
                        }
                        }                                 
                        */
                    }
                    return inResults;
                });
                if (sessionStorage.sorting == "true")
                    userList.sort("name", {
                        order: sorting
                    });
            }
        });

    }
}