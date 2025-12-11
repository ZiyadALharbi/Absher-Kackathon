window.Import = async funcarg => {
        for (let arg of funcarg) {
            let collector = 0,
                IntialFunc = parentfunctionName.filter(val => {
                    val.funcname == arg.moduleName && (collector = 1)
                });
            0 == collector && (parentfunctionName.push(arg),
                myparent.push(JSON.parse(JSON.stringify(arg))));
            const path = "/portal/individuals/assets/" + module + arg.moduleName + "/" + arg.moduleName + ".js?v=" + moduleVersion,
                absolutePath = "/portal/individuals/assets/" + module + arg.moduleName + "/",
                {
                    default: defaultImport
                } = await
            import (path);
            defaultImport(arg.moduleName, arg.param, absolutePath, arg.json, arg.action)
        }
    },
    window.func = async funcarg => {
        let IntialFunc = parentfunctionName.filter((val, index) => {
                funcarg.moduleName == val.moduleName && (parentfunctionName.splice(index, 1),
                    parentfunctionName.push(funcarg))
            }),
            f = JSON.parse(JSON.stringify(funcarg));
        const path = "/portal/individuals/assets/" + module + f.moduleName + "/" + f.moduleName + ".js?v=" + moduleVersion,
            absolutePath = "/portal/individuals/assets/" + module + f.moduleName + "/",
            {
                default: defaultImport
            } = await
        import (path);
        defaultImport(f.moduleName, f.param, absolutePath, f.json, f.action, "rebuild")
    };