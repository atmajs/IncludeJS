IncludeLib.Routes = RoutesLib;
IncludeLib.Resource = Resource;
IncludeLib.ScriptStack = ScriptStack;
IncludeLib.PathResolver = PathResolver;
IncludeLib.Config = Config;
IncludeLib.registerLoader = CustomLoader.register;

exports.include = new Include();
exports.includeLib = IncludeLib;
