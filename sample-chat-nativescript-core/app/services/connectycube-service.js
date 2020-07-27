const ConnectyCube = require('native-script-connectycube');

const config = [
    {
        appId: 218,
        authKey: 'p-cqm2aatn8ZPM3',
        authSecret: '3hmGuXN8AHZOgg6'
    },
    {
        debug: {
            mode: 1
        }
    }
];

exports.start = () => {
    ConnectyCube.init(...config);
};
