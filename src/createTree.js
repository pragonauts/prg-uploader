/*
 * @author David Menger
 */
'use strict';


function pathToDots (path) {
    return `${path}`.replace(/\[([^\]]+)]/g, '.$1')
        .replace(/^\./, '')
        .split('.');
}


function createTree (value, path, object = undefined) {
    if (typeof path === 'undefined') {
        return value;
    }
    let ret = object;
    const [attr, ...nextPath] = pathToDots(path);
    const keyAsNum = parseInt(attr, 10);
    const isArray = !isNaN(keyAsNum);
    let key = attr;

    if (isArray) {
        key = keyAsNum;
        if (ret === undefined) {
            ret = [];
        }
    } else if (ret === undefined) {
        ret = {};
    }
    ret[key] = createTree(value, nextPath.join('.') || undefined, ret[key]);
    return ret;
}

module.exports = createTree;
