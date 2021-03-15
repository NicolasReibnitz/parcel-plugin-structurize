/* eslint-disable no-console */
import chalk from 'chalk';

import { ConfigProvider } from './core/providers/Config';
import { AssetsGraphMap } from './core/AssetMap';

type LogType<T, K = string> = (arg0?: T & { verbose?: boolean }, clearLine?: boolean) => K[];

type Logs = {
    welcome: LogType<never>;
    error: LogType<{ error: Error }>;
    complete: LogType<{ total: number; difference: number; fileLogs: string[] }>;
    assetMap: LogType<{ assetMap: AssetsGraphMap }, string | Record<string, any>>;
    invalidConfigKey: LogType<{ key: string }>;
    noRules: LogType<never>;
};

type LogKey = keyof Logs;

const VerboseLogs: Array<LogKey> = ['assetMap'];

export const logs: Logs = {
    welcome() {
        return [
            '',
            chalk`{cyan parcel-plugin-structurize}`,
            chalk`{dim Config: ${ConfigProvider.config.filepath}}`,
        ];
    },
    error({ error }) {
        return [
            chalk`{yellow The plugin "parcel-plugin-structurize" has encountered an error.}`,
            '',
            chalk`{red ${error.stack}}`,
            '',
            chalk`{dim If you think this is a bug, use this link to report it on Github.}`,
            chalk`{dim http://bit.ly/parcel-plugin-structurize-bug}`,
        ];
    },
    complete({ total, difference, fileLogs, verbose }) {
        return [
            chalk`{green.bold Structurization complete. Modified ${total} files in ${difference}ms}`,
            ...(verbose ? ['', ...fileLogs, ''] : ['']),
            chalk`{white.dim If you loved the plugin, do consider starring the repository:}`,
            chalk`{white.dim https://github.com/samrith-s/parcel-plugin-structurize}`,
            '',
            chalk`{white.dim Think something could be improved? Create an issue on our repository:}`,
            chalk`{white.dim http://bit.ly/parcel-plugin-structurize-feature-request}`,
        ];
    },
    assetMap({ assetMap }) {
        return [
            'Assets Map:',
            Array.from(assetMap.entries()).reduce<Record<string, any>>(
                (acc, [key, value]) => ({
                    ...acc,
                    [key]: value,
                }),
                {}
            ),
        ];
    },
    invalidConfigKey({ key }) {
        return [chalk`{yellow Ignored invalid key '${key}'}`];
    },
    noRules() {
        return [
            '',
            chalk`{yellow No structurizers provided for 'rules' in config. parcel-plugin-structurize will have no effect.}`,
        ];
    },
};

export const logger = Object.entries(logs).reduce(
    (acc, [key, func]) => ({
        ...acc,
        [key]: (opts: Parameters<typeof func>[0], clearLine = true): void => {
            if (!ConfigProvider.isVerbose() && VerboseLogs.includes(key as LogKey)) {
                return;
            }

            logs[key]({ ...opts, verbose: ConfigProvider.isVerbose() }).forEach(item => {
                console.log(' ', item);
            });
            clearLine && console.log('');
        },
    }),
    {
        clearLine(lines = 1) {
            for (let i = 0; i < lines; i++) {
                console.log('');
            }
        },
    } as Logs & {
        clearLine: (lines?: number) => void;
    }
);
