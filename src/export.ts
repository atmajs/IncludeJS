import './global'

//#if (NODE)
import './node/export';
//#endif

import { RoutesLib } from './Routing'
import { Resource } from './Resource'
import { ScriptStack } from './ScriptStack'
import { PathResolver } from './PathResolver'
import { CustomLoader } from './CustomLoader'
import { Include } from './Include'
import { Config } from './Config'


const IncludeLib = {
    Routes: RoutesLib,
    Resource: Resource,
    ScriptStack: ScriptStack,
    PathResolver: PathResolver,
    Config: Config,
    registerLoader: CustomLoader.register,
    instance: Include.instance
}

export = {
    include: new Include,
    includeLib: IncludeLib
};
