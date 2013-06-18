
exports.include = new Include();

exports.includeLib = {
	Routes: RoutesLib,
	Resource: Resource,
	ScriptStack: ScriptStack,
	registerLoader: CustomLoader.register
};