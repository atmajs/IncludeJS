import { PathResolver } from '../PathResolver';

if (typeof document !== 'undefined') {
    let scriptImports = document.querySelector('script[type="importmap"]');
    if (scriptImports != null) {
        let json = JSON.parse(scriptImports.textContent) as { imports: Record<string, string> };
        let map = {} as Parameters<typeof PathResolver.configMap>[0];
        for (let key in json.imports) {
            map[key] = {
                path: json.imports[key],
                module: 'import'
            };
        }
        PathResolver.configMap(map);
    }
}
