import _data from 'simpleAndTraditionalData'

/**
 * 
 * @param {*} simpleChar 简体汉字
 * @return 有对于的繁体返回其繁体，没有返回null
 */
function simpleToTraditional(simpleChar) {
    const index = _data.simpleChars.indexOf(simpleChar)
    if (index > -1) {
        return _data.traditionalChars[index]
    }
    return null
}
export default simpleToTraditional