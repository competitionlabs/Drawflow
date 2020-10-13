import './polyfills';
import objectIterator from './utils/objectIterator';
import mapObject from './utils/mapObject';
import mergeObjects from './utils/mergeObjects';
import hasClass from './utils/hasClass';
import closest from './utils/closest';
import DrawflowModule from './modules/drawflow-module';
import Ajax from './utils/Ajax';
import query from './utils/query';

(function () {
	'use strict';

	const Drawflow = function ( options ) {

		var drawInstance = this;

		this.settings = {
			container: null, // primary container where dragged items live
			listContainer: null, // container for draggable items
			drawFlowModule: null,
			dataObjects: {
				data: [],
				listData: []
			},
			mobile_item_selec: '',
			mobile_last_move: null,
			transform: '',
			containerItemData: function(id, callback){
				if ( typeof callback === "function" ) {
					var found = false;
					mapObject(drawInstance.settings.dataObjects.listData, function (listItem) {
						if (!found && listItem.class === id) {
							found = true;
							callback(listItem);
						}
					});
				}
			},
			containerItemTemplate: function( id, data ){
				var dataObj = {};
				if( typeof data === "undefined" ) {
					mapObject(drawInstance.settings.dataObjects.listData, function (listItem) {
						if (listItem.class === id) {
							dataObj = listItem;
						}
					});
				} else {
					dataObj = data;
				}

				const item = document.createElement("div"),
					icon = document.createElement("i"),
					titleBox = document.createElement("div"),
					label = document.createElement("span");

				item.setAttribute("class", "drag-drawflow-item");

				icon.setAttribute("class", "fab fa-" + dataObj.class);

				titleBox.setAttribute("class", "drawflow-title-box title-box");
				label.innerHTML = " " + dataObj.name;

				titleBox.appendChild(icon);
				titleBox.appendChild(label);
				item.appendChild(titleBox);

				return item;
			},
			listTemplate: function( data ){
				const item = document.createElement("div"),
					icon = document.createElement("i"),
					label = document.createElement("span");

				item.setAttribute("class", "drag-drawflow");
				item.setAttribute("draggable", "true");
				item.dataset.node = data.class;

				icon.setAttribute("class", "fab fa-" + data.class);
				label.setAttribute("class", "drawflow-label");
				label.innerHTML = " " + data.name;

				item.appendChild(icon);
				item.appendChild(label);

				return item;
			}
		};

		if (typeof options !== 'undefined') {
			this.settings = mergeObjects(this.settings, options);
		}

		var ajaxInstance = new Ajax();
		this.ajax = function ( opts ) {
			return ajaxInstance.abort().getData(opts);
		};

		// query helper
		this.query = query;

		this.populateList = function () {
			var _this = this;

			if (_this.settings.listContainer !== null && _this.settings.dataObjects.listData) {
				_this.settings.listContainer.innerHTML = "";
				mapObject(_this.settings.dataObjects.listData, function ( listItem ) {
					var templateItem = _this.settings.listTemplate(listItem);

					_this.settings.listContainer.appendChild(templateItem);
				});
			}
		};

		this.positionMobile = function (ev) {
			drawInstance.settings.mobile_last_move = ev;
		};

		this.allowDrop = function (ev) {
			ev.preventDefault();
		}

		this.drag = function (ev) {
			if (ev.type === "touchstart") {
				drawInstance.settings.mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
			} else {
				drawInstance.settings.mobile_item_selec = ev.target.closest(".drag-drawflow").getAttribute('data-node');
				// ev.dataTransfer.setData("node", ev.target.getAttribute('data-node'));
			}
		}

		/**
		 * main handler that handles information transfer on touchend/drop events:
		 *
		 * - Event dataTransfer:
		 *   - MDN: https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer
		 *   - issues:  This feature is non-standard and is not on a standards track. Do not use it on production sites facing the Web: it will not work for every user. There may also be large incompatibilities between implementations and the behavior may change in the future.
		 *
		 * @param ev
		 */
		this.drop = function (ev) {
			if (ev.type === "touchend") {
				var parentdrawflow = document.elementFromPoint(drawInstance.settings.mobile_last_move.touches[0].clientX, drawInstance.settings.mobile_last_move.touches[0].clientY).closest("#drawflow");
				if (parentdrawflow != null) {
					drawInstance.addNodeToDrawFlow(drawInstance.settings.mobile_item_selec, drawInstance.settings.mobile_last_move.touches[0].clientX, drawInstance.settings.mobile_last_move.touches[0].clientY);
				}
				drawInstance.settings.mobile_item_selec = '';
			} else {
				ev.preventDefault();
				// var data = ev.dataTransfer.getData("node");
				var data = drawInstance.settings.mobile_item_selec;
				drawInstance.addNodeToDrawFlow(data, ev.clientX, ev.clientY);

				drawInstance.settings.mobile_item_selec = '';
			}

		}

		this.addNodeToDrawFlow = function (id, pos_x, pos_y) {
			if (this.settings.drawFlowModule.editor_mode === 'fixed') {
				return false;
			}
			pos_x = pos_x * (this.settings.drawFlowModule.precanvas.clientWidth / (this.settings.drawFlowModule.precanvas.clientWidth * this.settings.drawFlowModule.zoom)) - (this.settings.drawFlowModule.precanvas.getBoundingClientRect().x * (this.settings.drawFlowModule.precanvas.clientWidth / (this.settings.drawFlowModule.precanvas.clientWidth * this.settings.drawFlowModule.zoom)));
			pos_y = pos_y * (this.settings.drawFlowModule.precanvas.clientHeight / (this.settings.drawFlowModule.precanvas.clientHeight * this.settings.drawFlowModule.zoom)) - (this.settings.drawFlowModule.precanvas.getBoundingClientRect().y * (this.settings.drawFlowModule.precanvas.clientHeight / (this.settings.drawFlowModule.precanvas.clientHeight * this.settings.drawFlowModule.zoom)));

			drawInstance.settings.containerItemData(id, function(data){
				const item = drawInstance.settings.containerItemTemplate(id, data);

				drawInstance.settings.drawFlowModule.addNode(id, 1, 1, pos_x, pos_y, 'aws', data, item);
			});

		}

		this.showpopup = function (e) {
			e.target.closest(".drawflow-node").style.zIndex = "9999";
			e.target.children[0].style.display = "block";

			this.settings.transform = this.settings.drawFlowModule.precanvas.style.transform;
			this.settings.drawFlowModule.precanvas.style.transform = '';
			this.settings.drawFlowModule.precanvas.style.left = this.settings.drawFlowModule.canvas_x + 'px';
			this.settings.drawFlowModule.precanvas.style.top = this.settings.drawFlowModule.canvas_y + 'px';

			this.settings.drawFlowModule.editor_mode = "fixed";

		}

		this.closemodal = function (e) {
			e.target.closest(".drawflow-node").style.zIndex = "2";
			e.target.parentElement.parentElement.style.display = "none";
			//document.getElementById("modalfix").style.display = "none";
			this.settings.drawFlowModule.precanvas.style.transform = this.settings.transform;
			this.settings.drawFlowModule.precanvas.style.left = '0px';
			this.settings.drawFlowModule.precanvas.style.top = '0px';
			this.settings.drawFlowModule.editor_mode = "edit";
		}

		this.changeMode = function (option) {

			//console.log(lock.id);
			if(option == 'lock') {
				lock.style.display = 'none';
				unlock.style.display = 'block';
			} else {
				lock.style.display = 'block';
				unlock.style.display = 'none';
			}

		}

		this.eventListeners = function () {
			var _this = this;

			_this.settings.container.addEventListener('click', function(event){
				var el = event.target;

				if ( hasClass(el, "drawflow-clear") || closest(el, ".drawflow-clear") !== null ) {
					_this.settings.drawFlowModule.clearModuleSelected();
				} else if ( hasClass(el, "drawflow-zoom-out") || closest(el, ".drawflow-zoom-out") !== null ) {
					_this.settings.drawFlowModule.zoom_out();
				} else if ( hasClass(el, "drawflow-zoom-reset") || closest(el, ".drawflow-zoom-reset") !== null ) {
					_this.settings.drawFlowModule.zoom_reset();
				} else if ( hasClass(el, "drawflow-zoom-in") || closest(el, ".drawflow-zoom-in") !== null ) {
					_this.settings.drawFlowModule.zoom_in();
				}
			}, false);

			// Event examples
			/*_this.settings.drawFlowModule.on('nodeCreated', function (id) {
				console.log("Node created " + id);
			});

			_this.settings.drawFlowModule.on('nodeRemoved', function (id) {
				console.log("Node removed " + id);
			});

			_this.settings.drawFlowModule.on('nodeSelected', function (id) {
				console.log("Node selected " + id);
			});

			_this.settings.drawFlowModule.on('moduleCreated', function (name) {
				console.log("Module Created " + name);
			});

			_this.settings.drawFlowModule.on('moduleChanged', function (name) {
				console.log("Module Changed " + name);
			});

			_this.settings.drawFlowModule.on('connectionCreated', function (connection) {
				console.log('Connection created');
				console.log(connection);
			});

			_this.settings.drawFlowModule.on('connectionRemoved', function (connection) {
				console.log('Connection removed');
				console.log(connection);
			});

			_this.settings.drawFlowModule.on('nodeMoved', function (id) {
				console.log("Node moved " + id);
			});

			_this.settings.drawFlowModule.on('zoom', function (zoom) {
				console.log('Zoom level ' + zoom);
			});

			_this.settings.drawFlowModule.on('translate', function (position) {
				console.log('Translate x:' + position.x + ' y:' + position.y);
			});

			_this.settings.drawFlowModule.on('addReroute', function (id) {
				console.log("Reroute added " + id);
			});

			_this.settings.drawFlowModule.on('removeReroute', function (id) {
				console.log("Reroute removed " + id);
			});*/


			_this.settings.container.ondragover = this.allowDrop;
			_this.settings.container.ondrop = this.drop;




			/* DRAG EVENT */
			/* Mouse and Touch Actions */

			var elements = query(_this.settings.listContainer, '.drag-drawflow');
			objectIterator(elements, function (element) {
				element.addEventListener('touchend', _this.drop, false);
				element.addEventListener('touchmove', _this.positionMobile, false);
				element.addEventListener('touchstart', _this.drag, false);
				element.addEventListener('dragstart', _this.drag, false);
			});
		};

		this.init = function () {
			var _this = this;

			if (_this.settings.container !== null) {
				_this.settings.drawFlowModule.reroute = true;
				_this.settings.drawFlowModule.reroute_fix_curvature = true;
				_this.settings.drawFlowModule.force_first_input = false;

				_this.settings.drawFlowModule.drawflow = _this.settings.dataObjects.data;
				_this.settings.drawFlowModule.start();

				_this.populateList();
				_this.eventListeners();
			}
		};

		// initialise container
		if (this.settings.container !== null) {
			this.settings.drawFlowModule = new DrawflowModule(this.settings.container);
		} else {
			console.warn('container is not defined');
		}
	};

	if (typeof window.Drawflow === 'undefined') {
		window.Drawflow = Drawflow;
	} else {
		console.warn('window.Drawflow is already defined');
	}
})();