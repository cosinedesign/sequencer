/**
 * Created by Jim Ankrom on 7/18/2015.


 Rectangle <rect>
 TODO: Circle <circle>
 TODO: Ellipse <ellipse>
 TODO: Line <line>
 TODO: Polyline <polyline>
 TODO: Polygon <polygon>
 TODO: Path <path>



 */




var cosinedesign = cosinedesign || {};

cosinedesign.svg = (function (utils) {

    var svgNS="http://www.w3.org/2000/svg";

    function setValue (s, name, value) {
        var prop = s[name];
        if (prop) {
            prop.baseVal.value = value;
        }
    }

    function setValues (el, options) {
        utils.each(options, function (item, index, key) {
            setValue(el, key, item);
        });
    }

    function setAttributes (el, options) {
        utils.each(options, function (item, index, key) {
            el.setAttribute(key, item);
        });
    }

    function renderShapes() {
        this.shapes.each(function (item, index) {
            var s = shape(item);
            svg.appendChild(s);

            if (shape.onShapeCreated) {
                shape.onShapeCreated(s, index);
            }
        });
    }

    function svg (options) {
        var svg = document.createElementNS(svgNS,"svg"),
            defs;

        options = options || {};

        svg.style.border = '1px solid black';
        svg.style.stroke = options.stroke;

        svg.setAttribute('width', options.width || 100);
        svg.setAttribute('height', options.height || 100);

        utils.merge(svg, options);

        if (options.gradients) {
            defs = document.createElementNS(svgNS, 'defs');
            utils.each(options.gradients, function (g) {
                defs.appendChild(gradient(g));
            });
            svg.appendChild(defs);
        }

        //svg.shapes = utils.collections.list(options.shapes);
        //svg.renderShapes = renderShapes;

        return svg;
    }

    function shape (options) {
        options = options || {};
        options.width = options.width || 40;
        options.height = options.height || options.width;
        options.x = options.x || 0;
        options.y = options.y || 0;

        var shape = document.createElementNS(svgNS, options.shape || 'rect');

        setValues(shape, options);

        shape.style.fill = options.fill;
        shape.style.stroke = options.stroke;
        return shape;
    }

    function gradient (options) {
        var gradient = document.createElementNS(svgNS, options.gradient || 'linearGradient');

        setAttributes(gradient, {
            id: options.id || 'myGradient',
            x1: options.x1 || '0%',
            x2: options.x2 || '100%',
            y1: options.y1 || '0%',
            y2: options.y2 || '100%'
        });

        utils.each(options.stops, function (stop, index) {
            var s = document.createElementNS(svgNS, 'stop');
            setAttributes(s, stop);
            gradient.appendChild(s);
        });

        return gradient;

        //document.getElementById("mydefs").appendChild(myLinearGradient);
        //
        ////stops
        //var stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        //stop1.setAttribute("id", "myStop1");
        //stop1.setAttribute("offset", "70%");
        ////stop1.setAttribute("style", "stop-color: White; stop-opacity: 1");
        //stop1.setAttribute("stop-color", "White");
        //document.getElementById("mydefs").appendChild(stop1);
        //
        //var stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
        //stop2.setAttribute("id", "myStop2");
        //stop2.setAttribute("offset", "80%");
        ////stop2.setAttribute("style", "stop-color: #99cd9f; stop-opacity: 1");
        //stop2.setAttribute("stop-color", "#99cd9f");
        //document.getElementById("mydefs").appendChild(stop2);
        //
        //// Circle
        //var myCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        //myCircle.setAttribute("id", "idCircle");
        //myCircle.setAttribute("cx", "50px");
        //myCircle.setAttribute("cy", "50px");
        //myCircle.setAttribute("r", "50px");
        //
        //myCircle.setAttribute("fill", "url(#myLGID)");
        //
        //document.getElementById("Svg1").appendChild(myCircle);

    }


    return {
        create: {
            svg: svg,
            shape: shape
        }
    };
})(
    // dependencies
    cosinedesign.utility
);
