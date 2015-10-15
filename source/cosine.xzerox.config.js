/**
 * Created by cosinezero on 8/23/2015.
 */

var cosine = cosine || {};
cosine.xzerox = cosine.xzerox || {};

// TODO: Make some of these values responsive
cosine.xzerox.config = {
    server: {
        url: "http://localhost",
        port: 8000,
        apiPort: 7000,
        api: {
            pattern: "/pattern"
        }
    },
    grid: {
        border: 2,
            size: 30
    },
    commands: {
        active: {
            stroke: 'white',
            fill: '#000000'
        },
        inactive: {
            stroke: '#333333',
            fill: '#000000'
        }
    },
    actions: {
        active: {
            stroke: 'white'
        },
        inactive: {
            stroke: 'gray'
        }
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
                0: '#ffffff',
                    4: '#ffff00',
                    8: '#ff6600',
                    12: '#ff0000'
            }
        },
        off: {
            colors: {
                0: '#666666',
                    4: '#666600',
                    8: '#663300',
                    12: '#660000'
            }
        }
    },
    sequence: {
        button: {
            stroke: '#666666',
            fill: 'black'
        },
        selected: {
            stroke: '#ffffff',
            fill: 'orange'
        }
    }
};