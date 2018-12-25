import { Resource } from './Resource'

export interface IncludeNested {
    resource: Resource
    route: any
    isCyclic: boolean
    isLazy: boolean
}