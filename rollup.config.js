import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
            exports: 'named'
        },
        {
            file: 'dist/index.esm.js',
            format: 'esm',
            sourcemap: true
        }
    ],
    external: [
        'react',
        'react-dom',
        'next',
        'axios',
        'js-cookie'
    ],
    plugins: [
        resolve({
            extensions: ['.ts', '.tsx', '.js', '.jsx']
        }),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            useTsconfigDeclarationDir: true,
            tsconfigOverride: {
                compilerOptions: {
                    declaration: true,
                    declarationDir: './dist',
                    noEmit: false,
                    emitDeclarationOnly: false
                },
                exclude: ['**/__tests__/**', 'test-integration/**']
            }
        }),
        terser()
    ]
};
