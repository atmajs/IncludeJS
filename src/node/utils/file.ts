import { cfg } from '../../Config'
import * as _fs from 'fs';

const _watchers = {};

export function file_read(url: string, callback) {
	if (global.io && global.io.File) {
		readWithAtmaIo(global.io.File, url, callback);
		return;
	}
	if (cfg.sync) {
		try {
			var content = _fs.readFileSync(url, 'utf8');

			callback(null, content);
		} catch (error) {
			console.error('File Read - ', error);
		}

		return;
	}
	_fs.readFile(url, 'utf8', callback);
};

function readWithAtmaIo (File, url, callback) {
	if (cfg.sync) {
		let content = File.read(url);
		if (!content) {
			console.error(`File read error ${url}`;
		}
		callback(null, content);
		return;
	}

	File.readAsync(url).then(content => callback(null, content), callback);
}

export function file_watch(path, callback) {
	_unbind(path);
	_watchers[path] = _fs.watch(path, callback);
};

export function fs_exists(path) {
	return _fs.existsSync(path);
};



function _unbind(path) {
	if (_watchers[path] == null)
		return;

	_watchers[path].close();
	_watchers[path] = null;
}
