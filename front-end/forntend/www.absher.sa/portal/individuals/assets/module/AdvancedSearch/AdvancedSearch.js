export default (...parentparams) => {
    var ParentURL = '/wps/wcm/connect/individuals/';
    //Load Search and suggesstion data based on portal Language
    var tabSettingMenu = $('html').attr('lang') == 'en' ? ParentURL + '69603eed-73ae-4934-b7a2-1698de9c2385/services_suggestation_data_en.js?MOD=AJPERES' : ParentURL + '54a41d40-59d7-4ade-8524-54c4794e9954/services_suggestation_data_ar.js?MOD=AJPERES';
    var tabSettingLocalMenu = $('html').attr('lang') == 'en' ? '/portal/individuals/assets/migrated/services_suggestation_data_en.js?v=16072024' : '/portal/individuals/assets/migrated/services_suggestation_data_ar.js?v=16072024';
    //Load Search and suggesstion data based on portal environment
    var suggestionsURL = $('html').hasClass('prod') ? tabSettingMenu : tabSettingLocalMenu;
    const moduleApi = {
        json: [{
            'AdvancedSearchFilter': suggestionsURL
        }, {
            'localLang': suggestionsURL
        }]
    };
    let param = parentparams[1],
        json = moduleApi.json,
        _FunctionName = parentparams[0],
        filePath = parentparams[2],
        searchStyle = '',
        htmlpage, suggetionsData, AdvancedSearchFilter, localLang, localLangData;
    moduleName = parentparams[0];
    var AdvancedSearch = (params, functionMethod) => {
        errorCallBack(_FunctionName, "Started");
        let jsonfile = json;
        try {
            functionMethod(params, jsonfile)
        } catch (error) {
            ErrorCallBackfunction(_FunctionName, error);
        }
    };
    const CallBackAPISearch = async (jsonurl, method) => {
        let jsontype,
            url,
            mainLabelobj = {},
            i,
            sessionResponsObj = '',
            sessionTrue = '',
            fetchAPIData = '';
        const fetchAPI = async (...params) => {
            let dataReturn = {
                    status: '0'
                },
                Labelobj;
            try {
                Labelobj = await fetch(params[0], {
                    cache: params[1]
                });
                dataReturn = await Labelobj.text();
                eval(dataReturn);
                dataReturn = {
                    "reponseObj": eval(Object.keys(params[2])[0])
                };
                dataReturn.status = 200;
            } catch (e) {
                dataReturn = {
                    status: '404'
                };
                Labelobj = {
                    status: 404
                };
            }
            return {
                dataReturn,
                Labelobj
            };
        };
        for (i of jsonurl) {
            jsontype = Object.keys(i)[0];
            url = i[Object.keys(i)];
            try {
                fetchAPIData = await fetchAPI(url, 'no-cache', i);
                if (errorApi(fetchAPIData.Labelobj) == 0 && errorApi(fetchAPIData.dataReturn) == 0) {
                    Object.keys(i)[0] === "local" ? i[Object.keys(i)] = fetchAPIData.dataReturn : i[Object.keys(i)] = fetchAPIData.dataReturn.reponseObj;
                } else {
                    fatalError(id, typeof(fetchAPIData.dataReturn.reponseObj) != "string" && fetchAPIData.dataReturn.reponseObj != null ? fetchAPIData.dataReturn.reponseObj.errorModelList[0].errorMessage[langc] : '');
                }
            } catch (error) {
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
            if (jsontype != 0 && errorApi(i[Object.getOwnPropertyNames(i)]) == 0 && errorApi(fetchAPIData.dataReturn) == 0) {
                let key = Object.keys(i)[0];
                let value = i[Object.keys(i)[0]];
                Object.assign(mainLabelobj, {
                    [key]: value
                });
            }
        }
        return new Promise((resolve, reject) => resolve(mainLabelobj));
    };
    fileload(filePath + "template.js", "js");
    fileload(filePath + "style.css", "css");
    fileload(filePath + "list.min.js", "js");

    AdvancedSearch(param, (params, jsonfile) => {
        CallBackAPISearch(jsonfile, "GET").then((response) => {
            params.splice(1, 1);
            params.push(response);
            try {
                let id = params[0]['id'],
                    response = params[1][Object.keys(params[1])];
                moduleAPIObject = moduleAPIObj(id, response, moduleName, parentparams[0]);
                rootInitialiseFunction(params, AdvancedSearch);
                var mainarray = id.split(","),
                    existfuncname = 0,
                    className, styleName;
                if (response == "Dummy") {
                    var Dummy = response;
                    response = {
                        labels_i18n: {
                            en: {},
                            ar: {}
                        }
                    };
                }
                adpages(filePath, "index.js?v=" + moduleVersion).then(html => htmlpage = eval(html)).catch(error => console.log(error));
                errorCallBack(_FunctionName, "", "Success", "", id);
            } catch (error) {
                ErrorCallBackfunction(_FunctionName, error);
            }
        }).catch((error) => {
            ErrorCallBackfunction(_FunctionName, error);
        });
    });
}