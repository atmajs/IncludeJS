import * as IncludeModule from 'includedev';

export const $global = typeof global !== 'undefined' ? global :window;

export const includeModule = IncludeModule?.includeLib
    ? IncludeModule
    : $global.includeModule;

export const includeLib = includeModule.includeLib;

