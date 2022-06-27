export interface IPartialXMLHttpRequest {
    url: string
    status: number

    responseText: string
    readyState: number

    onreadystatechange: Function
    onerror: Function

    open(method: string, url: string, isSync?: boolean)
    on(event, cb)
    send()
    addEventListener(event, cb)
    getAllResponseHeaders(): any
}

export interface IPartialXMLHttpRequestCtor {
    new (): IPartialXMLHttpRequest
}
