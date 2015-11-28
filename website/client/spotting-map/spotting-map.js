/**
 * Currently active set of markers
 * @type {ReactiveVar} Array
 */
var markers = new ReactiveVar([]),
    /**
     * The marker that is currently being 'edited'
     * @type {ReactiveVar} Object
     */
    editMarker = new ReactiveVar(null),
    /**
     * The currently selected marker
     * @type {ReactiveVar} Object
     */
    selectedMarker = new ReactiveVar(null),
    /**
     * State boolean to check if the user has panned between a mouse down and a mouse up
     * @type {boolean}
     */
    hasPanned = false,
    /**
     * The container used for the PanZoom plugin
     * @type {jQuery}
     */
    $panZoomElement;

/**
 * Returns the given coordinates transformed by the current matrix transformation on the pan/zoom element.
 * @param {Number} x
 * @param {Number} y
 * @returns {{x: number, y: number}}
 */
function getCanvasCoords(x, y) {
    var matrix = $panZoomElement.panzoom("getMatrix");

    return {
        x: x * (1 / matrix[0]),  // multiply with inverse zoom factor
        y: y * (1 / matrix[3])
    };
}

/**
 * Initializes the 'pan/zoom' element
 * @param {Element} element
 */
function initPanZoom(element) {
    var $container = $(element),
        $canvas = $container.find('.canvas');

    $panZoomElement = $container.find('.image');

    $panZoomElement.panzoom({
        $zoomIn: $container.find('[data-do=zoom-in]'),
        $zoomOut: $container.find('[data-do=zoom-out]'),
        $zoomRange: $container.find('[data-do=zoom-range]'),
        $reset: $container.find('[data-do=reset]')
    });

    $canvas.on('mousewheel.focal dblclick', function (event) {
        var delta = event.delta || event.originalEvent.wheelDelta,
            zoomOut = delta ? delta < 0 : event.originalEvent.deltaY > 0;

        event.preventDefault();
        $panZoomElement.panzoom('zoom', zoomOut, {
            increment: event.type === 'dblclick' ? 0.5 : 0.1,
            animate: false,
            focal: event
        });
    });
}

/**
 * Removes any markers with the given coordinates
 * @param {Number} x
 * @param {Number} y
 */
function removeMarkerByCoordinate(x, y) {
    var _markers = markers.get();

    _markers = _markers.filter(function (item) {
        return item.x !== x && item.y !== y;
    });

    markers.set(_markers);
}

function markersEdited(newMarkers) {
    return JSON.stringify(markers.get()) !== JSON.stringify(newMarkers);
}

function markImageAsViewed() {
    var image = currentImage();

    Images.update(image._id, {
        '$addToSet': {
            'viewed': Meteor.connection._lastSessionId
        }
    });
}

Template.spottingMap.helpers({
    'image': function () {
        return currentImage();
    },
    'markers': function () {
        return markers.get();
    },
    'editMarker': function () {
        return editMarker.get();
    },
    'selectedMarker': function () {
        return selectedMarker.get();
    },
    'markersEdited': function () {
        return markersEdited(this.markers);
    },
    'markersNotEdited': function () {
        return !markersEdited(this.markers);
    }
});

Template.spottingMap.events({
    'mousemove .image': function () {
        hasPanned = $panZoomElement.panzoom('isPanning');
    },
    'click .marker': function (event) {
        var $target = $(event.target),
            selectedClass = 'is-selected',
            markerSelector = '.marker';

        $target.toggleClass(selectedClass).siblings(markerSelector).removeClass(selectedClass);
        selectedMarker.set(null);
        if ($target.hasClass(selectedClass)) {
            selectedMarker.set(this);
        }
    },
    'mouseup .image': function (event) {
        var $target = $(event.target);
        if (!hasPanned && !$target.hasClass('marker')) {
            var imagePosition = $(event.currentTarget).offset(),
                x = event.pageX - imagePosition.left,
                y = event.pageY - imagePosition.top;

            // prepare a new marker with translated coordinates:
            // setting this var 'opens' the marker types menu
            editMarker.set(getCanvasCoords(x, y));
        }
        hasPanned = false;
    },
    /**
     * Handles saving the markers to the current image
     * @this {{}} The current image
     */
    'click [data-do=save]': function () {
        var newMarkers = markers.get(),
            oldMarkers = Images.findOne(this._id).markers,
            differentMarkers;

        differentMarkers = newMarkers.filter(function (newMarker) {
            return oldMarkers.every(function (oldMarker) {
                return oldMarker.x !== newMarker.x && oldMarker.y !== newMarker.y;
            });
        });

        Images.update(this._id, {
            '$set': {
                'markers': markers.get()
            }
        });
        Session.set('addedMarkers', differentMarkers);
        markImageAsViewed();
        Router.go('thanks');
    },
    /**
     * Handles editing of a marker
     */
    'click [data-do=edit-marker]': function () {
        var marker = this;

        editMarker.set(marker);
    },
    /**
     * Handles editing of a marker to the map.
     * @param event
     */
    'click [data-do=save-marker]': function (event) {
        var $button = $(event.currentTarget),
            marker = editMarker.get(),
            _markers;

        removeMarkerByCoordinate(marker.x, marker.y);

        _markers = markers.get();

        marker.type = $button.data('marker-type');
        marker.description = $button.text();

        _markers.push(marker);
        markers.set(_markers);

        editMarker.set(null);
    },
    /**
     * Handles removal of a marker
     * @this {{}} The marker object to remove
     */
    'click [data-do=remove-marker]': function () {
        var marker = this;

        removeMarkerByCoordinate(marker.x, marker.y);
    },
    /**
     * Debugging handler to easily clear all markers on the given image
     */
    'click [data-do=clear-markers]': function () {
        markers.set([]);
    },
    'click [data-do=next]': function () {
        markImageAsViewed();

        Router.go('next');
    }
});

Template.spottingMap.onCreated(function () {
    this.autorun(function (comp) {
        var img = currentImage();
        if (img) {
            markers.set(img.markers);
            comp.stop();
        }
    });
});

Template.spottingMap.onRendered(function () {
    this.autorun(comp => {
        if (currentImage()) {
            initPanZoom(this.firstNode);
            comp.stop();
        }
    });
});

/**
 * reactive
 */
function currentImage() {
	console.log("CurrentImage from route", Router.current().name);
    var imageId = Router.current().params.imageId;
    if (!imageId) {
        imageId = window.location.href.split('/').pop();
    }
    console.info(imageId);

    return Images.findOne(imageId);
}
