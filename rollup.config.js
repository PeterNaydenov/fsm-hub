import resolve    from '@rollup/plugin-node-resolve'
import commonjs   from '@rollup/plugin-commonjs'
import terser from '@rollup/plugin-terser';


export default [
	// browser-friendly UMD build
	{
		input: 'src/main.js',
		output: {
			name: 'fsmHub',
			file: 'dist/fsm-hub.umd.js',
			format: 'umd'
		},
		plugins: [
			resolve(), // bundle ask-for-promise and @peter.naydenov/stack
			commonjs()
			, terser()
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify
	// `file` and `format` for each target)
	{
		input: 'src/main.js',
		external: [ 'ask-for-promise', '@peter.naydenov/stack' ],
		output: [
			{ file: 'dist/fsm-hub.cjs'    , format: 'cjs' },
			{ file: 'dist/fsm-hub.esm.mjs', format: 'es' }
		],
		plugins: [ terser() ]
	}
];