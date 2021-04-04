let express = require('express'),
    bodyParser = require('body-parser'),
    settings = require('./config/settings'),
    cors = require('cors'),
    // jwt = require('./routes/middlewares/jwt'),
    errorHandler = require('./utils/errorHandler');
let { controllerUser,controllerNews,controllerAddress } = require('./routes');
const app = express();
app.use(cors());
app.use(bodyParser.json());
// app.use(jwt());
app.use(errorHandler);
app.use("/api/v1", controllerUser);
app.use("/api/v1", controllerNews);
app.use("/api/v1", controllerAddress);
app.listen(settings.port, '0.0.0.0', function () {
    console.log('Server running on port ' + settings.port);
});