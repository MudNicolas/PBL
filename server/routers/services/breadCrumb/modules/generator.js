import routeTree from "./tree.js"

export default async function generateBreadCrumb(name, id) {
    let tree = new routeTree()
    let p = name
    let gen = []
    while (p != "Null") {
        let t = tree.get(p)
        if (t) {
            gen.push(t)
            p = t.parent
        } else {
            p = "Home"
        }
    }
    //parentID不断传递更新
    let fid = id

    //处理path query
    let queryHandler = {
        query: {},
        name: "",
    }

    for (let f of gen) {
        if (typeof f.path === "function") {
            let func = f.path
            f.path = func(fid)
        }
        if (typeof f.path === "string" && f.path !== "*") {
            f.path += fid
        }

        if (f.name === queryHandler.name) {
            f.path = {
                path: f.path,
                query: queryHandler.query,
            }
        }

        if (f.parentQuery) {
            queryHandler = {
                query: f.parentQuery,
                name: f.queryParentName,
            }
        }

        if (f.meta && f.meta.title && typeof f.meta.title === "function") {
            let func = f.meta.title
            let funcTitle = await func(fid) //
            if (funcTitle && funcTitle.name) {
                f.meta.title = funcTitle.name
                if (funcTitle.parentID) {
                    fid = funcTitle.parentID
                }
            }
        }
    }
    gen.reverse()
    return gen
}
