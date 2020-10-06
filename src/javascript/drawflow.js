import './polyfills';
import Drawflow from './modules/drawflow-module';

(function () {
	'use strict';

	if (typeof window.Drawflow === 'undefined') {
		window.Drawflow = Drawflow;
	} else {
		console.warn('window.Drawflow is already defined');
	}
})();