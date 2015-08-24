/**
 * Created by cosinezero on 8/23/2015.
 */

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};

// TODO: Make some of these values responsive
cosine.xzerox.config = {
    grid: {
        border: 2,
            size: 30
    },
    pattern: {
        steps: 16
    },
    xox: {
        new: {
            fill: '#FF00FF'
        }
    },
    buttons: {
        on: {
            colors: {
                0: 'white',
                    4: 'yellow',
                    8: 'orange',
                    12: 'red'
            }
        },
        off: {
            colors: {
                0: '#999999',
                    4: '#999900',
                    8: '#993300',
                    12: '#990000'
            }
        }
    },
    sequence: {
        button: {
            fill: '#00FF00'
        },
        selected: {
            fill: 'orange'
        }
    }
};